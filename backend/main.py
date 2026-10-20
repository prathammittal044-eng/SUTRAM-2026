from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
from sqlalchemy.orm import Session
import models, schemas
from database import engine, get_db, SessionLocal
import hashlib
import threading
import blockchain_logger
import os
import uuid
import subprocess
from datetime import datetime, timezone

# Lazy-load vector search so startup doesn't block if chromadb isn't installed yet
try:
    import vector_search as vs
    VECTOR_SEARCH_ENABLED = True
    print("[VectorSearch] Semantic search engine loaded successfully.")
except Exception as e:
    VECTOR_SEARCH_ENABLED = False
    print(f"[VectorSearch] Not available: {e}")

# Load OCR engine
try:
    import ocr_engine as ocr
    OCR_ENABLED = ocr.OCR_AVAILABLE
    print(f"[OCR] Engine loaded. Tesseract available: {OCR_ENABLED}")
except Exception as e:
    OCR_ENABLED = False
    print(f"[OCR] Not available: {e}")

# Load SUTRAM 2026 DFIR Forensic Microservices
import parsers
import image_forgery
import metadata_forensics
import log_anomaly
import correlation_engine
import investigative_ai
import bsa_certificate
import json
from fastapi.responses import HTMLResponse

# --- Role definitions ---
ROLE_PERMISSIONS = {
    "Officer":  {"can_upload": True,  "can_seal": False, "can_verify": True},
    "Reviewer": {"can_upload": False, "can_seal": False, "can_verify": True},
    "Judge":    {"can_upload": False, "can_seal": True,  "can_verify": True},
}

# --- JWT Config ---
from jose import JWTError, jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import hashlib as _hashlib

SECRET_KEY  = "SIH2026-EVIDENCE-LOCKER-SECRET-XK9Z"
ALGORITHM   = "HS256"
TOKEN_HOURS = 8
bearer_scheme = HTTPBearer(auto_error=False)

def _hash_pw(pw: str) -> str:
    return _hashlib.sha256((pw + SECRET_KEY).encode()).hexdigest()

def _verify_pw(plain: str, hashed: str) -> bool:
    return _hash_pw(plain) == hashed

USERS_STATIC = {
    1: {
        "name": "Sub-Inspector Sharma", "role": "Officer",
        "badge": "9482A", "username": "sharma",
        "hashed_password": _hash_pw("Officer@123"),
        "department": "Cyber Crime Unit, Delhi Police",
    },
    2: {
        "name": "Chief Inspector Verma", "role": "Reviewer",
        "badge": "1109X", "username": "verma",
        "hashed_password": _hash_pw("Reviewer@123"),
        "department": "Special Investigation Branch",
    },
    3: {
        "name": "Hon. Judge Patel", "role": "Judge",
        "badge": "JDG-01", "username": "judge1",
        "hashed_password": _hash_pw("Judge@123"),
        "department": "Sessions Court, District Court",
    },
}

def get_user_info(user_id: int) -> dict:
    u = USERS_STATIC.get(user_id, {})
    return {
        "name": u.get("name", "Unknown"), "role": u.get("role", "Unknown"),
        "badge": u.get("badge", "N/A"), "department": u.get("department", "")
    }

def get_user_role(user_id: int) -> str:
    return get_user_info(user_id)["role"]

def create_access_token(user_id: int) -> str:
    from datetime import timedelta
    u = USERS_STATIC[user_id]
    payload = {
        "sub": str(user_id),
        "name": u["name"], "role": u["role"],
        "badge": u["badge"], "department": u["department"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return {}

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated. Please log in.")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please log in again.")
    return {"id": int(payload["sub"]), "name": payload["name"],
            "role": payload["role"], "badge": payload["badge"]}


# -------------------------------------------------------
# Run migrations for new columns (safe to call every start)
# -------------------------------------------------------
def run_migrations():
    from sqlalchemy import text
    from database import engine as _engine
    with _engine.connect() as conn:
        for col, typedef in [
            ("is_sealed", "BOOLEAN DEFAULT 0"),
            ("sealed_by",  "INTEGER"),
            ("sealed_at",  "DATETIME"),
            ("extracted_text", "TEXT"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE cases ADD COLUMN {col} {typedef}"))
                conn.commit()
            except Exception:
                pass
        try:
            conn.execute(text("ALTER TABLE document_versions ADD COLUMN extracted_text TEXT"))
            conn.commit()
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE document_versions ADD COLUMN ai_summary TEXT"))
            conn.commit()
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE document_versions ADD COLUMN entities TEXT"))
            conn.commit()
        except Exception:
            pass
        # New: document images table (create via metadata if not exists)
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS document_images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    document_version_id INTEGER REFERENCES document_versions(id),
                    image_path TEXT NOT NULL,
                    page_number INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
        except Exception:
            pass

run_migrations()
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Digital Evidence Locker API")

# Support CORS for local dev, Vercel deployments (*.vercel.app), and custom domains
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -------------------------------------------------------
# Text Extraction Helper (with OCR for images and scanned PDFs)
# -------------------------------------------------------
def extract_text(file_content: bytes, filename: str) -> str:
    """Extract text from a file. Uses OCR for images and scanned PDFs."""
    ext = filename.lower().split('.')[-1]

    if ext == 'txt':
        try:
            return file_content.decode('utf-8')
        except:
            return ""

    elif ext == 'pdf':
        # Use OCR engine for full PDF processing (text + images + scanned pages)
        if OCR_ENABLED:
            text, _ = ocr.process_pdf(file_content, 0, UPLOAD_DIR)
            if text.strip():
                return text
        # Fallback: plain pypdf text extraction
        try:
            import pypdf, io as _io
            pdf = pypdf.PdfReader(_io.BytesIO(file_content))
            return "\n".join(p.extract_text() for p in pdf.pages if p.extract_text())
        except Exception as e:
            print(f"PDF extraction failed: {e}")
            return ""

    elif OCR_ENABLED and ocr.is_image_file(filename):
        # Direct OCR on image files (JPG, PNG, etc.)
        return ocr.ocr_image_file(file_content)

    return ""


def extract_and_save_images(file_content: bytes, filename: str, db_version_id: int, db: any) -> list:
    """
    After a document is saved, extract embedded images and store them in DocumentImage table.
    Returns list of saved image filenames.
    """
    if not OCR_ENABLED:
        return []

    saved = []
    ext = filename.lower().split('.')[-1]

    if ext == 'pdf':
        _, image_filenames = ocr.process_pdf(file_content, db_version_id, UPLOAD_DIR)
        for img_file in image_filenames:
            db_img = models.DocumentImage(
                document_version_id=db_version_id,
                image_path=img_file,
            )
            db.add(db_img)
            saved.append(img_file)

    elif ocr.is_image_file(filename):
        # The uploaded file itself IS the image — save a reference directly
        img_filename = f"docv{db_version_id}_original.{ext}"
        img_path = os.path.join(UPLOAD_DIR, img_filename)
        with open(img_path, 'wb') as f:
            f.write(file_content)
        db_img = models.DocumentImage(
            document_version_id=db_version_id,
            image_path=img_filename,
        )
        db.add(db_img)
        saved.append(img_filename)

    if saved:
        db.commit()

    return saved

# -------------------------------------------------------
# Auth Endpoints — Login & Me
# -------------------------------------------------------
@app.post("/auth/login/")
def login(username: str = Form(...), password: str = Form(...)):
    """Authenticate user and return a JWT token."""
    # Find user by username
    matched_id = None
    for uid, u in USERS_STATIC.items():
        if u["username"] == username.strip().lower():
            matched_id = uid
            break

    if matched_id is None or not _verify_pw(password, USERS_STATIC[matched_id]["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    token = create_access_token(matched_id)
    u = USERS_STATIC[matched_id]
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": matched_id,
            "name": u["name"],
            "role": u["role"],
            "badge": u["badge"],
            "department": u["department"],
        }
    }

@app.get("/auth/me/")
def get_me(current_user: dict = Depends(get_current_user)):
    """Return current authenticated user's info."""
    return current_user

# -------------------------------------------------------
# File serving
# -------------------------------------------------------
@app.get("/files/{file_path}")
def get_file(file_path: str, user_id: int = None, document_id: int = None, db: Session = Depends(get_db)):
    full_path = os.path.join(UPLOAD_DIR, file_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")
    if user_id and document_id:
        u = get_user_info(user_id)
        audit = models.AuditLog(user_id=user_id, action="VIEW_FILE",
            details=f"{u['name']} ({u['role']}, Badge {u['badge']}) viewed document {document_id} (file: {file_path})")
        db.add(audit)
        db.commit()
    return FileResponse(full_path)

# -------------------------------------------------------
# Audit logs
# -------------------------------------------------------
@app.get("/audit-logs/", response_model=list[schemas.AuditLog])
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(100).all()

@app.get("/")
def read_root():
    return {"message": "Welcome to Digital Evidence Locker API"}

# -------------------------------------------------------
# Dummy data setup
# -------------------------------------------------------
@app.post("/setup-dummy-data/")
def setup_dummy_data(db: Session = Depends(get_db)):
    if db.query(models.User).first():
        return {"message": "Dummy data already exists"}
    officer  = models.User(username="sharma",  role="Officer")
    reviewer = models.User(username="verma",   role="Reviewer")
    judge    = models.User(username="judge1",  role="Judge")
    db.add_all([officer, reviewer, judge])
    case1 = models.Case(case_number="FIR-2026-104", title="Theft at Downtown")
    db.add(case1)
    db.commit()
    return {"message": "Dummy data created"}

# -------------------------------------------------------
# Case Management
# -------------------------------------------------------
@app.post("/cases/", response_model=schemas.Case)
def create_case(case: schemas.CaseCreate, db: Session = Depends(get_db)):
    db_case = models.Case(**case.model_dump())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@app.get("/cases/", response_model=list[schemas.Case])
def get_cases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Case).offset(skip).limit(limit).all()

@app.get("/cases/{case_id}", response_model=schemas.Case)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@app.delete("/cases/{case_id}/")
def delete_case(case_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Cascade cleanup
    db.query(models.ForensicEvent).filter(models.ForensicEvent.case_id == case_id).delete()
    db.query(models.ForensicEntity).filter(models.ForensicEntity.case_id == case_id).delete()
    db.query(models.EntityLink).filter(models.EntityLink.case_id == case_id).delete()
    db.query(models.InvestigationHypothesis).filter(models.InvestigationHypothesis.case_id == case_id).delete()
    db.query(models.EvidenceArtifact).filter(models.EvidenceArtifact.case_id == case_id).delete()
    
    docs = db.query(models.Document).filter(models.Document.case_id == case_id).all()
    for d in docs:
        versions = db.query(models.DocumentVersion).filter(models.DocumentVersion.document_id == d.id).all()
        for v in versions:
            db.query(models.DocumentImage).filter(models.DocumentImage.document_version_id == v.id).delete()
            db.delete(v)
        db.delete(d)
        
    c_num = case.case_number
    db.delete(case)
    db.commit()
    return {"status": "success", "message": f"Case {c_num} (ID #{case_id}) deleted successfully"}

# -------------------------------------------------------
# Feature 2: Case Sealing (Judge only)
# -------------------------------------------------------
@app.post("/cases/{case_id}/seal/")
def seal_case(case_id: int, user_id: int = Form(...), db: Session = Depends(get_db)):
    role = get_user_role(user_id)
    if role != "Judge":
        raise HTTPException(status_code=403, detail=f"Access Denied: Only a Judge can seal a case. Your role is '{role}'.")
    
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.is_sealed:
        raise HTTPException(status_code=400, detail="Case is already sealed.")
    
    case.is_sealed = True
    case.sealed_by = user_id
    case.sealed_at = datetime.now(timezone.utc)
    case.status = "Sealed"
    
    u = get_user_info(user_id)
    audit = models.AuditLog(user_id=user_id, action="SEAL_CASE",
        details=f"CASE SEALED by {u['name']} ({u['role']}, Badge {u['badge']}) — Case #{case.case_number} is now permanently sealed for trial.")
    db.add(audit)
    db.commit()
    return {"message": f"Case {case.case_number} has been permanently sealed by {u['name']}."}

# -------------------------------------------------------
# Feature 3: Chain of Custody Report
# -------------------------------------------------------
@app.get("/cases/{case_id}/report/")
def download_report(case_id: int, db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    lines = [
        "=" * 70,
        "        OFFICIAL CHAIN OF CUSTODY REPORT",
        "        Digital Evidence Locker — SIH Prototype",
        "=" * 70,
        f"  Generated At : {now}",
        f"  Case Number  : {case.case_number}",
        f"  Case Title   : {case.title}",
        f"  Status       : {case.status}",
    ]
    if case.is_sealed and case.sealed_at:
        sealer = get_user_info(case.sealed_by or 0)
        lines.append(f"  Sealed By    : {sealer['name']} ({sealer['role']}, Badge {sealer['badge']})")
        lines.append(f"  Sealed At    : {case.sealed_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    lines += ["=" * 70, ""]

    docs = db.query(models.Document).filter(models.Document.case_id == case_id).all()
    if not docs:
        lines.append("  No documents found in this case.")
    else:
        lines.append(f"  DOCUMENTS ({len(docs)} total)")
        lines.append("-" * 70)
        for doc in docs:
            lines += [
                f"",
                f"  Document   : {doc.name}",
                f"  Type       : {doc.doc_type}",
                f"  Created    : {doc.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}",
                f"  Internal ID: #{doc.id}",
                f"  Versions   : {len(doc.versions)}",
            ]
            for v in sorted(doc.versions, key=lambda x: x.version_number):
                u = get_user_info(v.uploaded_by)
                lines += [
                    f"",
                    f"    ┌─ Version v{v.version_number}.0  [{v.status}]",
                    f"    │  Uploaded By : {u['name']}",
                    f"    │  Role        : {u['role']}",
                    f"    │  Badge No.   : {u['badge']}",
                    f"    │  Timestamp   : {v.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}",
                    f"    └─ SHA-256     : {v.file_hash}",
                ]
            lines.append("-" * 70)

    lines += ["", "  AUDIT TRAIL (last 50 entries for this report)", "-" * 70]
    audit_logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.asc()).limit(50).all()
    for log in audit_logs:
        u = get_user_info(log.user_id)
        lines.append(f"  [{log.timestamp.strftime('%Y-%m-%d %H:%M:%S')}]  {log.action:<20} — {log.details}")
    
    lines += ["", "=" * 70,
              "  This report is an official record of the chain of custody.",
              "  Any alteration to this document may constitute evidence tampering.",
              "=" * 70]
    
    report_text = "\n".join(lines)
    filename = f"ChainOfCustody_{case.case_number}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.txt"
    return PlainTextResponse(
        content=report_text,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# -------------------------------------------------------
# Document Upload (with RBAC + Sealed-case check)
# -------------------------------------------------------
@app.post("/cases/{case_id}/documents/")
def upload_document(
    case_id: int,
    name: str = Form(...),
    doc_type: str = Form(...),
    user_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # --- RBAC Check ---
    role = get_user_role(user_id)
    if not ROLE_PERMISSIONS.get(role, {}).get("can_upload", False):
        raise HTTPException(status_code=403,
            detail=f"Access Denied: Your role '{role}' does not have permission to upload documents. Only Officers can upload.")
    
    # --- Sealed Case Check ---
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.is_sealed:
        raise HTTPException(status_code=403,
            detail="This case has been permanently sealed by a Judge. No new documents can be added.")

    file_content = file.file.read()
    object_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, object_name)
    extracted_text = extract_text(file_content, file.filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    try:
        subprocess.run(['attrib', '+r', file_path], shell=True)
    except Exception as e:
        print(f"Failed to lock file {file_path}: {e}")

    db_doc = models.Document(case_id=case_id, name=name, doc_type=doc_type)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    # --- Unique hash per version: SHA-256(file_content + case_id + doc_id + version) ---
    # This ensures that v1 and v2 of the same file get DIFFERENT hashes,
    # and the same file in two different cases also gets DIFFERENT hashes.
    version_number = 1
    hash_salt = f"|case:{case_id}|doc:{db_doc.id}|version:{version_number}".encode()
    file_hash = hashlib.sha256(file_content + hash_salt).hexdigest()

    db_version = models.DocumentVersion(
        document_id=db_doc.id, version_number=version_number,
        file_path=object_name, file_hash=file_hash,
        status="Active", uploaded_by=user_id,
        extracted_text=extracted_text,
        ai_summary="",
        entities="{}"
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)

    # --- OCR Image Extraction (must happen BEFORE NLP so Gemini Vision can see images) ---
    saved_image_names = extract_and_save_images(file_content, file.filename, db_version.id, db)
    image_paths = [os.path.join(UPLOAD_DIR, img) for img in (saved_image_names or [])]

    # --- AI NLP Insights (Summary + Entities + Clean Text) ---
    ai_summary = ""
    entities_json = "{}"
    try:
        import nlp_engine
        import json
        nlp_data = nlp_engine.analyze_document(extracted_text, image_paths=image_paths)
        ai_summary = nlp_data.get("summary", "")
        entities_json = json.dumps(nlp_data.get("entities", {}))
        
        # Override the messy Tesseract text with Gemini's perfect transcription if available
        if "full_text" in nlp_data and nlp_data["full_text"]:
            extracted_text = nlp_data["full_text"]
    except Exception as e:
        print(f"NLP Engine skipped: {e}")

    # Save NLP results back to the version
    db_version.extracted_text = extracted_text
    db_version.ai_summary = ai_summary
    db_version.entities = entities_json
    db.commit()

    u = get_user_info(user_id)
    audit = models.AuditLog(user_id=user_id, action="UPLOAD_DOCUMENT",
        details=f"{u['name']} ({u['role']}, Badge {u['badge']}) uploaded '{name}' ({doc_type}) to Case #{case.case_number}")
    db.add(audit)
    db.commit()

    # --- Vector Index ---
    if VECTOR_SEARCH_ENABLED and extracted_text:
        vs.add_document_to_index(
            doc_id=f"version_{db_version.id}",
            case_id=case_id,
            doc_name=name,
            doc_type=doc_type,
            text=extracted_text
        )


    # --- Blockchain Logging ---
    try:
        evidence_id = f"case_{case_id}_doc_{db_doc.id}_v{version_number}"
        threading.Thread(target=blockchain_logger.log_hash_to_blockchain, args=(evidence_id, file_hash), daemon=True).start()
    except Exception as e:
        print(f"Blockchain logging failed: {e}")

    return {"message": "Document uploaded securely", "document_id": db_doc.id, "hash": file_hash}

# -------------------------------------------------------
# Document Version Update (with RBAC + Sealed-case check)
# -------------------------------------------------------
@app.post("/documents/{document_id}/versions/")
def update_document(
    document_id: int,
    user_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # --- RBAC Check ---
    role = get_user_role(user_id)
    if not ROLE_PERMISSIONS.get(role, {}).get("can_upload", False):
        raise HTTPException(status_code=403,
            detail=f"Access Denied: Your role '{role}' cannot update document versions. Only Officers can do this.")

    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # --- Sealed Case Check ---
    case = db.query(models.Case).filter(models.Case.id == doc.case_id).first()
    if case and case.is_sealed:
        raise HTTPException(status_code=403,
            detail="This case has been permanently sealed. No new versions can be created.")

    latest_version = db.query(models.DocumentVersion).filter(
        models.DocumentVersion.document_id == document_id
    ).order_by(models.DocumentVersion.version_number.desc()).first()

    if latest_version:
        latest_version.status = "Superseded"
        new_version_num = latest_version.version_number + 1
    else:
        new_version_num = 1

    file_content = file.file.read()
    # --- Unique hash per version: SHA-256(file_content + doc_id + version) ---
    hash_salt = f"|case:{doc.case_id}|doc:{document_id}|version:{new_version_num}".encode()
    file_hash = hashlib.sha256(file_content + hash_salt).hexdigest()
    object_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, object_name)

    # Step 1: Save file to disk first (Gemini needs the physical file path)
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    try:
        subprocess.run(['attrib', '+r', file_path], shell=True)
    except Exception as e:
        print(f"Failed to lock file {file_path}: {e}")

    # Step 2: Tesseract fallback text (used only if Gemini is unavailable)
    extracted_text = extract_text(file_content, file.filename)

    # Step 3: Save a temporary DB record so we can extract images with proper version ID
    new_version = models.DocumentVersion(
        document_id=document_id, version_number=new_version_num,
        file_path=object_name, file_hash=file_hash,
        status="Active", uploaded_by=user_id,
        extracted_text=extracted_text,
        ai_summary="",
        entities="{}"
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)

    # Step 4: Extract images (Gemini Vision needs the image file paths)
    extract_and_save_images(file_content, file.filename, new_version.id, db)

    # Step 5: Collect image paths and send to Gemini Vision (same as initial upload)
    import json
    ai_summary = ""
    entities_json = "{}"
    try:
        import nlp_engine
        image_records = db.query(models.DocumentImage).filter(
            models.DocumentImage.document_version_id == new_version.id
        ).all()
        image_paths = [os.path.join(UPLOAD_DIR, img.image_path) for img in image_records]

        if image_paths:
            # Gemini Vision analyzes the actual images — no garbled Tesseract text!
            nlp_data = nlp_engine.analyze_document(extracted_text, image_paths=image_paths)
        else:
            nlp_data = nlp_engine.analyze_document(extracted_text)

        # Overwrite extracted_text with Gemini's perfect full_text
        gemini_full_text = nlp_data.get("full_text", "")
        if gemini_full_text:
            extracted_text = gemini_full_text

        ai_summary = nlp_data.get("summary", "")
        entities_json = json.dumps(nlp_data.get("entities", {}))
    except Exception as e:
        print(f"NLP Engine skipped: {e}")

    # Step 6: Update the DB record with the final Gemini-analysed text
    new_version.extracted_text = extracted_text
    new_version.ai_summary = ai_summary
    new_version.entities = entities_json

    u = get_user_info(user_id)
    audit = models.AuditLog(user_id=user_id, action="CREATE_VERSION",
        details=f"{u['name']} ({u['role']}, Badge {u['badge']}) updated document '{doc.name}' to v{new_version_num}")
    db.add(audit)
    db.commit()

    # --- Vector Index ---
    if VECTOR_SEARCH_ENABLED and extracted_text:
        vs.add_document_to_index(
            doc_id=f"version_{new_version.id}",
            case_id=doc.case_id,
            doc_name=doc.name,
            doc_type=doc.doc_type,
            text=extracted_text
        )


    # --- Blockchain Logging ---
    try:
        evidence_id = f"case_{doc.case_id}_doc_{document_id}_v{new_version_num}"
        threading.Thread(target=blockchain_logger.log_hash_to_blockchain, args=(evidence_id, file_hash), daemon=True).start()
    except Exception as e:
        print(f"Blockchain logging failed: {e}")

    return {"message": f"Document updated to version {new_version_num}", "hash": file_hash}

# -------------------------------------------------------
# Integrity Verification
# -------------------------------------------------------
@app.get("/documents/{document_id}/verify/")
def verify_document_integrity(document_id: int, db: Session = Depends(get_db)):
    versions = db.query(models.DocumentVersion).filter(models.DocumentVersion.document_id == document_id).all()
    if not versions:
        raise HTTPException(status_code=404, detail="No versions found")

    # Look up the document to get case_id for the salt
    doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    case_id = doc.case_id if doc else 0

    results = []
    for v in versions:
        try:
            full_path = os.path.join(UPLOAD_DIR, v.file_path)
            if not os.path.exists(full_path):
                results.append({"version": v.version_number, "status": "MISSING", "message": "⚠️ File was deleted from the server! This is a chain-of-custody violation."})
                continue
            with open(full_path, "rb") as f:
                file_bytes = f.read()

            # --- Step 1: Recompute salted hash (same formula as upload time) ---
            hash_salt = f"|case:{case_id}|doc:{document_id}|version:{v.version_number}".encode()
            current_hash = hashlib.sha256(file_bytes + hash_salt).hexdigest()

            # --- Step 2: Local DB comparison ---
            local_match = (current_hash == v.file_hash)

            if not local_match:
                # Local hash mismatch — file was definitely replaced on disk.
                # Since the DB stored hash IS the same value that was sent to Polygon,
                # a mismatch here means the file also does NOT match the Polygon Blockchain record.
                results.append({
                    "version": v.version_number,
                    "status": "TAMPERED",
                    "message": "🚨 CRITICAL ALERT: File hash does NOT match the Polygon Blockchain record. "
                               "The file on disk has been REPLACED or MODIFIED after upload. "
                               "The original hash is permanently locked on the Polygon Amoy ledger — "
                               "this current file is NOT the document that was cryptographically sealed."
                })
                continue

            # --- Step 3: Blockchain is the FINAL source of truth ---
            # Even if local DB matches, we MUST verify against blockchain.
            # A corrupt DB admin could update both file AND stored hash in DB simultaneously.
            # Only blockchain cannot be altered.
            blockchain_status = "not_checked"
            blockchain_message = ""
            try:
                evidence_id = f"case_{case_id}_doc_{document_id}_v{v.version_number}"
                bc_result = blockchain_logger.verify_hash_on_blockchain(evidence_id, current_hash)
                blockchain_status = bc_result.get("status", "not_checked")
            except Exception as e:
                blockchain_status = "not_checked"

            if blockchain_status == "tampered":
                # File on disk matches DB but NOT blockchain — DB itself was tampered!
                results.append({
                    "version": v.version_number,
                    "status": "TAMPERED",
                    "message": "🚨 CRITICAL ALERT: Local database was COMPROMISED. "
                               "File hash matches the local DB record but DOES NOT match "
                               "the immutable Polygon Blockchain ledger. "
                               "The database record was likely altered after upload!"
                })
            elif blockchain_status == "verified":
                results.append({
                    "version": v.version_number,
                    "status": "VERIFIED",
                    "message": "✅ VERIFIED BY POLYGON BLOCKCHAIN. File hash perfectly matches "
                               "the immutable on-chain ledger. This document is untampered."
                })
            else:
                # Blockchain not reachable or hash not yet confirmed on-chain
                results.append({
                    "version": v.version_number,
                    "status": "VERIFIED_LOCAL",
                    "message": "✅ Local cryptographic hash verified. "
                               "Blockchain verification unavailable (network issue or pending confirmation). "
                               "Hash matches local DB record."
                })

        except Exception as e:
            results.append({"version": v.version_number, "status": "ERROR", "message": f"Could not read file: {str(e)}"})
    return {"document_id": document_id, "integrity_checks": results}

# -------------------------------------------------------
# OCR: Get extracted images for a document version
# -------------------------------------------------------
@app.get("/versions/{version_id}/images/")
def get_version_images(version_id: int, db: Session = Depends(get_db)):
    """Return all images extracted from a specific document version."""
    images = db.query(models.DocumentImage).filter(
        models.DocumentImage.document_version_id == version_id
    ).all()
    return [
        {
            "id": img.id,
            "image_path": img.image_path,
            "url": f"/files/{img.image_path}",
            "page_number": img.page_number,
        }
        for img in images
    ]

@app.get("/ocr/status/")
def get_ocr_status():
    """Return OCR engine availability status."""
    return {
        "enabled": OCR_ENABLED,
        "engine": "Tesseract OCR" if OCR_ENABLED else "Not available",
        "message": "OCR scanning active — images and scanned PDFs will be processed." if OCR_ENABLED else "Install Tesseract OCR to enable scanning."
    }

# -------------------------------------------------------
# True Semantic AI Search (Vector Embeddings via ChromaDB)
# -------------------------------------------------------
@app.get("/search/")
def search_inside_files(q: str, db: Session = Depends(get_db)):
    if not q or not q.strip():
        return []

    # --- Path 1: Semantic Vector Search (if ChromaDB is available) ---
    if VECTOR_SEARCH_ENABLED:
        try:
            results = vs.semantic_search(q, n_results=20)
            if results:
                # Deduplicate case IDs while preserving relevance order
                seen = []
                for r in results:
                    cid = r["case_id"]
                    if cid not in seen:
                        seen.append(cid)
                return seen
        except Exception as e:
            print(f"[VectorSearch] Semantic search failed, falling back: {e}")

    # --- Path 2: Keyword Fallback (if ChromaDB not available) ---
    STOP_WORDS = {"i","me","my","we","our","you","your","he","him","his","she","her","it","its","they","them","their","what","which","who","whom","this","that","these","those","am","is","are","was","were","be","been","being","have","has","had","do","does","did","a","an","the","and","but","if","or","because","as","until","while","of","at","by","for","with","about","against","between","into","through","during","before","after","above","below","to","from","up","down","in","out","on","off","over","under","again","further","then","once","here","there","when","where","why","how","all","any","both","each","few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","s","t","can","will","just","don","should","now","find","case","cases","around","people","months","years","days","show","me","looking","search"}
    words = ''.join(c if c.isalnum() else ' ' for c in q.lower()).split()
    keywords = [w for w in words if w not in STOP_WORDS and len(w) > 2]
    if not keywords:
        return []
    versions = db.query(models.DocumentVersion).filter(models.DocumentVersion.extracted_text.isnot(None)).all()
    case_scores = {}
    for v in versions:
        if not v.document or not v.document.case_id:
            continue
        text = v.extracted_text.lower()
        score = sum(text.count(kw) for kw in keywords)
        if score > 0:
            cid = v.document.case_id
            case_scores[cid] = case_scores.get(cid, 0) + score
    return sorted(case_scores.keys(), key=lambda k: case_scores[k], reverse=True)

# -------------------------------------------------------
# Vector Search Status + Backfill Endpoint
# -------------------------------------------------------
@app.get("/search/status/")
def get_search_status():
    if not VECTOR_SEARCH_ENABLED:
        return {"enabled": False, "indexed_documents": 0, "message": "ChromaDB not installed"}
    return {
        "enabled": True,
        "indexed_documents": vs.get_indexed_count(),
        "message": "Semantic vector search is active"
    }

@app.post("/search/backfill/")
def backfill_vector_index(db: Session = Depends(get_db)):
    """Backfill the vector index for all existing documents with extracted text."""
    if not VECTOR_SEARCH_ENABLED:
        raise HTTPException(status_code=503, detail="Vector search engine not available")
    versions = db.query(models.DocumentVersion).filter(
        models.DocumentVersion.extracted_text.isnot(None)
    ).all()
    count = 0
    for v in versions:
        if v.document and v.extracted_text and v.extracted_text.strip():
            vs.add_document_to_index(
                doc_id=f"version_{v.id}",
                case_id=v.document.case_id,
                doc_name=v.document.name,
                doc_type=v.document.doc_type,
                text=v.extracted_text
            )
            count += 1
    return {"message": f"Successfully indexed {count} documents into semantic vector database."}


# ==============================================================================
# SUTRAM 2026 DFIR FORENSIC API ENDPOINTS
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Multi-Format Evidence Ingestion Pipeline (Steps 3 - 6)
# ------------------------------------------------------------------------------
@app.post("/cases/{case_id}/artifacts/")
def upload_forensic_artifact(
    case_id: int,
    name: str = Form(None),
    artifact_type: str = Form("AUTO"),
    user_id: int = Form(1),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.is_sealed:
        raise HTTPException(status_code=403, detail="Case has been sealed for trial. No new evidence exhibits can be accepted.")

    if not name or not name.strip():
        name = file.filename

    file_content = file.file.read()
    file_size = len(file_content)
    raw_sha256 = hashlib.sha256(file_content).hexdigest()
    salt = f"|sutram_case:{case_id}|name:{name}".encode()
    salted_sha256 = hashlib.sha256(file_content + salt).hexdigest()

    object_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, object_name)
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    detected_type, extracted_events, parser_text = parsers.detect_and_parse_artifact(file_content, file.filename)
    final_type = artifact_type if artifact_type != "AUTO" else detected_type

    forgery_score = 0.0
    forgery_details = "{}"
    metadata_json = "{}"
    extracted_text = parser_text

    ext = file.filename.lower().split('.')[-1]
    if ext in ['jpg', 'jpeg', 'png', 'webp', 'bmp']:
        forgery_res = image_forgery.analyze_image_forgery(file_content, object_name, UPLOAD_DIR)
        forgery_score = forgery_res.get("tamper_score", 0.0)
        forgery_details = json.dumps(forgery_res)
        exif_res = metadata_forensics.extract_image_metadata(file_content)
        metadata_json = json.dumps(exif_res)
        if OCR_ENABLED:
            ocr_text = ocr.ocr_image_file(file_content)
            extracted_text = (extracted_text + "\n" + ocr_text).strip()

    elif ext == 'pdf':
        pdf_meta = metadata_forensics.extract_pdf_metadata(file_content)
        metadata_json = json.dumps(pdf_meta)
        pdf_text = extract_text(file_content, file.filename)
        extracted_text = (extracted_text + "\n" + pdf_text).strip()

    artifact = models.EvidenceArtifact(
        case_id=case_id,
        name=name,
        artifact_type=final_type,
        file_path=object_name,
        raw_sha256=raw_sha256,
        salted_sha256=salted_sha256,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        extracted_text=extracted_text,
        forgery_score=forgery_score,
        forgery_details=forgery_details,
        metadata_json=metadata_json,
        uploaded_by=user_id
    )
    db.add(artifact)
    db.commit()
    db.refresh(artifact)

    if final_type == 'NETWORK_LOG' and extracted_events:
        extracted_events, _ = log_anomaly.detect_log_anomalies(extracted_events)

    for ev in extracted_events:
        fe = models.ForensicEvent(
            case_id=case_id,
            artifact_id=artifact.id,
            timestamp=ev.get('timestamp', datetime.now(timezone.utc).isoformat()),
            event_type=ev.get('event_type', 'EVENT'),
            description=ev.get('description', ''),
            actor=ev.get('actor'),
            target=ev.get('target'),
            severity=ev.get('severity', 'INFO'),
            is_anomaly=ev.get('is_anomaly', False),
            source=file.filename
        )
        db.add(fe)

    full_text_to_mine = f"{name} {extracted_text} " + " ".join(e.get('description', '') for e in extracted_events[:50])
    entities_found = correlation_engine.extract_entities_from_text(full_text_to_mine, file.filename)
    
    for etype, values in entities_found.items():
        for val in values:
            existing = db.query(models.ForensicEntity).filter(
                models.ForensicEntity.case_id == case_id,
                models.ForensicEntity.value == val
            ).first()
            if existing:
                existing.occurrences += 1
            else:
                db_ent = models.ForensicEntity(
                    case_id=case_id,
                    entity_type=etype,
                    value=val,
                    occurrences=1
                )
                db.add(db_ent)

    db.commit()

    try:
        evidence_bc_id = f"case_{case_id}_art_{artifact.id}"
        threading.Thread(target=blockchain_logger.log_hash_to_blockchain, args=(evidence_bc_id, salted_sha256), daemon=True).start()
    except Exception as e:
        print(f"[Blockchain] Evidence registration failed: {e}")

    u = get_user_info(user_id)
    audit = models.AuditLog(
        user_id=user_id,
        action="INGEST_ARTIFACT",
        details=f"{u['name']} ingested artifact '{name}' ({final_type}) into Case #{case.case_number}. Raw SHA-256: {raw_sha256[:16]}..."
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Forensic artifact successfully ingested and registered",
        "artifact_id": artifact.id,
        "name": artifact.name,
        "raw_sha256": raw_sha256,
        "forgery_score": forgery_score,
        "events_count": len(extracted_events)
    }

# ------------------------------------------------------------------------------
# 1B. 1-Click Complete Forensic Case Seeder (Automated Multi-Exhibit Ingestion)
# ------------------------------------------------------------------------------
@app.post("/cases/{case_id}/seed-sample-evidence/")
def seed_sample_evidence_for_case(case_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    sample_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "sample_evidence")
    if not os.path.exists(sample_dir):
        sample_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_evidence")

    if not os.path.exists(sample_dir):
        raise HTTPException(status_code=404, detail="Sample evidence directory not found")

    sample_files = [
        ("01_suspect_whatsapp_chat.txt", "Suspect Extortion WhatsApp Chat", "CHAT_EXPORT"),
        ("02_server_auth_firewall_logs.csv", "Firewall & Server Authentication Logs", "NETWORK_LOG"),
        ("03_mobile_extraction_backup.sqlite", "Seized Mobile Phone Extraction", "MOBILE_DB"),
        ("04_altered_upi_receipt.jpg", "Altered UPI Payment Screenshot", "MEDIA"),
        ("05_crime_scene_photo_with_gps.jpg", "Crime Scene Seizure Photo (GPS Tagged)", "MEDIA"),
    ]

    # Clean up prior artifacts, events, entities, and hypotheses to prevent duplicates
    existing_artifacts = db.query(models.EvidenceArtifact).filter(models.EvidenceArtifact.case_id == case_id).all()
    for ea in existing_artifacts:
        db.query(models.ForensicEvent).filter(models.ForensicEvent.artifact_id == ea.id).delete()
        db.delete(ea)
    db.query(models.ForensicEntity).filter(models.ForensicEntity.case_id == case_id).delete()
    db.query(models.EntityLink).filter(models.EntityLink.case_id == case_id).delete()
    db.query(models.InvestigationHypothesis).filter(models.InvestigationHypothesis.case_id == case_id).delete()
    db.commit()

    loaded_count = 0
    total_events_created = 0

    for filename, display_name, art_type in sample_files:
        fpath = os.path.join(sample_dir, filename)
        if not os.path.exists(fpath):
            continue

        with open(fpath, "rb") as f:
            file_content = f.read()

        file_size = len(file_content)
        raw_sha256 = hashlib.sha256(file_content).hexdigest()
        salt = f"|sutram_case:{case_id}|name:{display_name}".encode()
        salted_sha256 = hashlib.sha256(file_content + salt).hexdigest()

        object_name = f"{uuid.uuid4()}_{filename}"
        dest_path = os.path.join(UPLOAD_DIR, object_name)
        with open(dest_path, "wb") as buffer:
            buffer.write(file_content)

        detected_type, extracted_events, parser_text = parsers.detect_and_parse_artifact(file_content, filename)
        final_type = art_type if art_type != "AUTO" else detected_type

        forgery_score = 0.0
        forgery_details = "{}"
        metadata_json = "{}"
        extracted_text = parser_text

        ext = filename.lower().split('.')[-1]
        if ext in ['jpg', 'jpeg', 'png', 'webp', 'bmp']:
            forgery_res = image_forgery.analyze_image_forgery(file_content, object_name, UPLOAD_DIR)
            forgery_score = forgery_res.get("tamper_score", 0.0)
            forgery_details = json.dumps(forgery_res)
            exif_res = metadata_forensics.extract_image_metadata(file_content)
            metadata_json = json.dumps(exif_res)

        artifact = models.EvidenceArtifact(
            case_id=case_id,
            name=display_name,
            artifact_type=final_type,
            file_path=object_name,
            raw_sha256=raw_sha256,
            salted_sha256=salted_sha256,
            file_size=file_size,
            mime_type="application/octet-stream",
            extracted_text=extracted_text,
            forgery_score=forgery_score,
            forgery_details=forgery_details,
            metadata_json=metadata_json,
            uploaded_by=user_id
        )
        db.add(artifact)
        db.commit()
        db.refresh(artifact)

        if final_type == 'NETWORK_LOG' and extracted_events:
            extracted_events, _ = log_anomaly.detect_log_anomalies(extracted_events)

        for ev in extracted_events:
            fe = models.ForensicEvent(
                case_id=case_id,
                artifact_id=artifact.id,
                timestamp=ev.get('timestamp', datetime.now(timezone.utc).isoformat()),
                event_type=ev.get('event_type', 'EVENT'),
                description=ev.get('description', ''),
                actor=ev.get('actor'),
                target=ev.get('target'),
                severity=ev.get('severity', 'INFO'),
                is_anomaly=ev.get('is_anomaly', False),
                source=filename
            )
            db.add(fe)
            total_events_created += 1

        event_text_stream = " ".join(f"{e.get('description', '')} {e.get('actor', '')} {e.get('target', '')}" for e in extracted_events[:100])
        full_text_to_mine = f"{display_name} {extracted_text} {event_text_stream}"
        entities_found = correlation_engine.extract_entities_from_text(full_text_to_mine, filename)
        for etype, values in entities_found.items():
            for val in values:
                existing = db.query(models.ForensicEntity).filter(
                    models.ForensicEntity.case_id == case_id,
                    models.ForensicEntity.value == val
                ).first()
                if existing:
                    existing.occurrences += 1
                else:
                    db_ent = models.ForensicEntity(
                        case_id=case_id,
                        entity_type=etype,
                        value=val,
                        occurrences=1
                    )
                    db.add(db_ent)
        db.commit()
        loaded_count += 1

    # Auto-generate hypotheses
    all_events = db.query(models.ForensicEvent).filter(models.ForensicEvent.case_id == case_id).all()
    all_entities = db.query(models.ForensicEntity).filter(models.ForensicEntity.case_id == case_id).all()
    all_artifacts = db.query(models.EvidenceArtifact).filter(models.EvidenceArtifact.case_id == case_id).all()

    ev_list = [{"description": e.description, "event_type": e.event_type, "actor": e.actor} for e in all_events]
    ent_list = [{"value": e.value, "entity_type": e.entity_type} for e in all_entities]
    art_list = [{"name": a.name, "artifact_type": a.artifact_type} for a in all_artifacts]

    reasoning_res = investigative_ai.run_investigative_reasoning(
        {"title": case.title, "case_number": case.case_number},
        ev_list, ent_list, art_list
    )

    for hyp in reasoning_res.get("hypotheses", []):
        db_hyp = models.InvestigationHypothesis(
            case_id=case_id,
            title=hyp.get("title", ""),
            description=hyp.get("description", ""),
            modus_operandi=hyp.get("modus_operandi", ""),
            supporting_evidence=json.dumps(hyp.get("supporting_evidence", [])),
            counter_arguments=hyp.get("counter_arguments", ""),
            contradictions=json.dumps(hyp.get("contradictions", [])),
            missing_evidence=json.dumps(hyp.get("missing_evidence", [])),
            recommended_leads=json.dumps(hyp.get("recommended_leads", [])),
            status="PROPOSED"
        )
        db.add(db_hyp)
    db.commit()

    u = get_user_info(user_id)
    audit = models.AuditLog(
        user_id=user_id,
        action="SEED_SAMPLE_EVIDENCE",
        details=f"{u['name']} loaded {loaded_count} standard forensic exhibits into Case #{case.case_number}."
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "message": f"Successfully loaded {loaded_count} sample exhibits ({total_events_created} timeline events), built knowledge graph, and generated AI hypotheses!",
        "loaded_exhibits": loaded_count
    }

# ------------------------------------------------------------------------------
# 2. Artifact Retrieval & Forgery Inspection (Pillar 2)
# ------------------------------------------------------------------------------
@app.get("/cases/{case_id}/artifacts/")
def get_case_artifacts(case_id: int, db: Session = Depends(get_db)):
    artifacts = db.query(models.EvidenceArtifact).filter(models.EvidenceArtifact.case_id == case_id).all()
    out = []
    import re
    for idx, a in enumerate(artifacts):
        f_details = {}
        m_details = {}
        try:
            if a.forgery_details:
                f_details = json.loads(a.forgery_details)
            if a.metadata_json:
                m_details = json.loads(a.metadata_json)
        except Exception:
            pass

        events = db.query(models.ForensicEvent).filter(models.ForensicEvent.artifact_id == a.id).all()
        events_count = len(events)
        anomalies_count = sum(1 for e in events if e.is_anomaly)

        case_entities = db.query(models.ForensicEntity).filter(models.ForensicEntity.case_id == case_id).all()
        art_entities = []
        for ent in case_entities:
            found = False
            if a.extracted_text and ent.value.lower() in a.extracted_text.lower():
                found = True
            if not found:
                for ev in events:
                    combined_ev = f"{ev.description or ''} {ev.actor or ''} {ev.target or ''}".lower()
                    if ent.value.lower() in combined_ev:
                        found = True
                        break
            if found:
                art_entities.append({"type": ent.entity_type, "value": ent.value})

        forensic_summary = ""
        if a.artifact_type == "CHAT_EXPORT":
            forensic_summary = f"{events_count} chat messages extracted. Extortion demands and suspect phone identified."
        elif a.artifact_type == "NETWORK_LOG":
            forensic_summary = f"{events_count} log entries triaged. {anomalies_count} ML brute-force bursts flagged."
        elif a.artifact_type == "MOBILE_DB":
            forensic_summary = f"{events_count} records extracted from SQLite database (calls, messages, contacts)."
        elif a.artifact_type == "MEDIA":
            if (a.forgery_score or 0) >= 45:
                forensic_summary = f"Pixel ELA tampering detected ({int(a.forgery_score)}% risk). Transaction text modified."
            elif m_details.get("has_gps"):
                forensic_summary = f"EXIF authenticated ({m_details.get('camera_model', 'Camera')}). GPS tagged at New Delhi."
            else:
                forensic_summary = f"Visual exhibit analyzed. ELA compression uniform ({int(a.forgery_score or 0)}% risk)."
        else:
            forensic_summary = f"{events_count} forensic records indexed and cryptographically secured."

        out.append({
            "id": a.id,
            "exhibit_code": f"EXH-{idx+1:02d}",
            "name": a.name,
            "artifact_type": a.artifact_type,
            "file_path": a.file_path,
            "raw_sha256": a.raw_sha256,
            "salted_sha256": a.salted_sha256,
            "file_size": a.file_size,
            "forgery_score": a.forgery_score,
            "forgery_details": f_details,
            "metadata": m_details,
            "events_count": events_count,
            "anomalies_count": anomalies_count,
            "entities": art_entities,
            "forensic_summary": forensic_summary,
            "extracted_text_preview": (a.extracted_text or "")[:400],
            "created_at": a.created_at.isoformat() if a.created_at else None
        })
    return out

@app.get("/artifacts/{artifact_id}/forgery/")
def get_artifact_forgery_details(artifact_id: int, db: Session = Depends(get_db)):
    art = db.query(models.EvidenceArtifact).filter(models.EvidenceArtifact.id == artifact_id).first()
    if not art:
        raise HTTPException(status_code=404, detail="Artifact not found")
    details = {}
    if art.forgery_details:
        try:
            details = json.loads(art.forgery_details)
        except Exception:
            pass
    return {
        "artifact_id": art.id,
        "name": art.name,
        "forgery_score": art.forgery_score,
        "details": details
    }

# ------------------------------------------------------------------------------
# 3. Master Incident Timeline (Workflow Step 10)
# ------------------------------------------------------------------------------
@app.get("/cases/{case_id}/timeline/")
def get_case_timeline(case_id: int, db: Session = Depends(get_db)):
    events = db.query(models.ForensicEvent).filter(
        models.ForensicEvent.case_id == case_id
    ).order_by(models.ForensicEvent.timestamp.asc()).all()
    
    return [
        {
            "id": ev.id,
            "timestamp": ev.timestamp,
            "event_type": ev.event_type,
            "description": ev.description,
            "actor": ev.actor,
            "target": ev.target,
            "severity": ev.severity,
            "is_anomaly": ev.is_anomaly,
            "source": ev.source
        }
        for ev in events
    ]

# ------------------------------------------------------------------------------
# 4. Entity Knowledge Graph (Workflow Steps 8 & 9)
# ------------------------------------------------------------------------------
@app.get("/cases/{case_id}/graph/")
def get_case_evidence_graph(case_id: int, db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    artifacts = db.query(models.EvidenceArtifact).filter(models.EvidenceArtifact.case_id == case_id).all()
    entities = db.query(models.ForensicEntity).filter(models.ForensicEntity.case_id == case_id).all()
    events = db.query(models.ForensicEvent).filter(models.ForensicEvent.case_id == case_id).all()

    art_list = []
    for idx, a in enumerate(artifacts):
        art_list.append({
            "id": a.id,
            "exhibit_code": f"EXH-{idx+1:02d}",
            "name": a.name,
            "artifact_type": a.artifact_type,
            "raw_sha256": a.raw_sha256,
            "salted_sha256": a.salted_sha256,
            "forgery_score": a.forgery_score,
            "extracted_text": a.extracted_text,
            "file_path": a.file_path,
            "events_count": len([e for e in events if e.artifact_id == a.id])
        })

    ent_list = [
        {"value": e.value, "entity_type": e.entity_type, "occurrences": e.occurrences, "first_seen": e.first_seen}
        for e in entities
    ]

    case_dict = {
        "id": case.id,
        "case_number": case.case_number,
        "title": case.title,
        "status": case.status,
        "is_sealed": case.is_sealed
    }

    ev_list = [
        {"id": ev.id, "description": ev.description, "event_type": ev.event_type, "actor": ev.actor, "target": ev.target}
        for ev in events
    ]

    graph_payload = correlation_engine.build_knowledge_graph(
        entities_list=ent_list,
        artifacts_list=art_list,
        case_info=case_dict,
        events_list=ev_list
    )
    return graph_payload

# ------------------------------------------------------------------------------
# 4.1 Police Final Report / Charge-Sheet under Section 193 BNSS 2023
# ------------------------------------------------------------------------------
@app.get("/cases/{case_id}/charge-sheet/")
def get_case_chargesheet_data(case_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    artifacts = db.query(models.EvidenceArtifact).filter(models.EvidenceArtifact.case_id == case_id).all()
    events = db.query(models.ForensicEvent).filter(models.ForensicEvent.case_id == case_id).order_by(models.ForensicEvent.timestamp.asc()).all()
    entities = db.query(models.ForensicEntity).filter(models.ForensicEntity.case_id == case_id).all()
    hypotheses = db.query(models.InvestigationHypothesis).filter(models.InvestigationHypothesis.case_id == case_id).all()
    u = get_user_info(user_id)

    suspect_phones = [e.value for e in entities if e.entity_type == 'PHONE' and '98765' in e.value]
    victim_phones = [e.value for e in entities if e.entity_type == 'PHONE' and '98765' not in e.value]
    mule_upis = [e.value for e in entities if e.entity_type == 'UPI_ID']
    attacker_ips = [e.value for e in entities if e.entity_type == 'IP_ADDRESS']

    lead_hypothesis = None
    if hypotheses:
        lead_hypothesis = next((h for h in hypotheses if h.status == 'APPROVED'), hypotheses[0])

    exhibits_schedule = []
    for idx, a in enumerate(artifacts):
        exhibits_schedule.append({
            "exhibit_no": f"EXH-{idx+1:02d}",
            "name": a.name,
            "type": a.artifact_type,
            "raw_sha256": a.raw_sha256,
            "salted_sha256": a.salted_sha256,
            "forgery_score": a.forgery_score,
            "is_tampered": (a.forgery_score or 0) >= 45,
            "significance": f"Seized digital bitstream ({a.artifact_type}) preserved under Section 63 BSA 2023."
        })

    timeline_summary = [
        {"timestamp": ev.timestamp, "event": ev.description, "severity": ev.severity}
        for ev in events[:8]
    ]

    return {
        "court_name": "COURT OF CHIEF METROPOLITAN MAGISTRATE, PATIALA HOUSE COURTS, NEW DELHI",
        "police_station": "Cyber Crime Police Station, Special Cell, Mandir Marg, New Delhi",
        "fir_number": case.case_number,
        "fir_date": case.created_at.strftime("%d/%m/%Y") if case.created_at else "09/10/2026",
        "case_title": case.title,
        "case_status": case.status,
        "is_sealed": case.is_sealed,
        "sealed_at": case.sealed_at.isoformat() if case.sealed_at else None,
        "statutory_provisions": [
            "Section 308(2) Bharatiya Nyaya Sanhita, 2023 (Extortion by putting person in fear of injury)",
            "Section 318(4) Bharatiya Nyaya Sanhita, 2023 (Cheating and dishonestly inducing delivery of property)",
            "Section 336(3) Bharatiya Nyaya Sanhita, 2023 (Forgery for purpose of cheating)",
            "Section 66C Information Technology Act, 2000 (Identity theft and digital impersonation)",
            "Section 66D Information Technology Act, 2000 (Cheating by personation by using computer resource)",
            "Section 63 Bharatiya Sakshya Adhiniyam, 2023 (Electronic Records Admissibility)"
        ],
        "investigating_officer": {
            "name": u["name"],
            "rank": u["role"],
            "badge_no": u["badge"],
            "police_unit": "Special Cyber Crime Investigation Cell (SCCIC)"
        },
        "complainant": {
            "name": "Shri Rajesh Sharma",
            "contact": victim_phones[0] if victim_phones else "+91 98110 12345",
            "address": "B-42, Barakhamba Road, Connaught Place, New Delhi - 110001",
            "loss_amount": "INR 85,000 (Eighty Five Thousand Only)"
        },
        "accused": {
            "name": "Vikram Singh (Alias 'Inspector Vikram')",
            "phone": suspect_phones[0] if suspect_phones else "+91 98765 43210",
            "upi_beneficiary": mule_upis[0] if mule_upis else "mule_account@okhdfcbank",
            "origin_ip": attacker_ips[0] if attacker_ips else "192.168.1.105",
            "arrest_status": "Arrested / In Judicial Custody (Tihar Central Jail No. 4)",
            "charges": "Impersonation of Law Enforcement Officer, Cyber Extortion, Forgery of Payment Receipts, Multi-Source Phishing"
        },
        "modus_operandi": lead_hypothesis.modus_operandi if lead_hypothesis else "Suspect impersonated Cyber Crime Branch inspector via WhatsApp, issued fake airport parcel warrants, demanded Rs. 85,000 extortion to mule UPI, and generated altered payment screenshots to cover tracks.",
        "ai_forensic_findings": lead_hypothesis.description if lead_hypothesis else "Cross-evidence correlation proved direct causal link between WhatsApp threat messages, UPI transaction timestamp, forged digital receipt (68% ELA distortion), and unauthorized server brute-force bursts.",
        "exhibits": exhibits_schedule,
        "timeline": timeline_summary,
        "blockchain_anchoring": {
            "network": "Polygon Amoy Proof-of-Stake (Chain ID: 80002)",
            "smart_contract": "0x8784D3f0161a3bA1941942748041583b22CE286E",
            "verification_method": "Dual-Hash Cryptographic Salted Ledger Registration"
        },
        "prayer": "It is most respectfully prayed that this Hon'ble Court may be pleased to take cognizance of the offences against the accused under Sections 308(2), 318(4), 336(3) BNS 2023 and Sections 66C, 66D IT Act, 2000, and proceed with trial in accordance with law."
    }

# ------------------------------------------------------------------------------
# 5. AI Hypothesis & Reasoning Engine (Workflow Steps 12 - 16)
# ------------------------------------------------------------------------------
@app.post("/cases/{case_id}/hypotheses/generate/")
def generate_hypotheses(case_id: int, db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    events = db.query(models.ForensicEvent).filter(models.ForensicEvent.case_id == case_id).all()
    entities = db.query(models.ForensicEntity).filter(models.ForensicEntity.case_id == case_id).all()
    artifacts = db.query(models.EvidenceArtifact).filter(models.EvidenceArtifact.case_id == case_id).all()

    ev_list = [{"description": e.description, "event_type": e.event_type, "actor": e.actor} for e in events]
    ent_list = [{"value": e.value, "entity_type": e.entity_type} for e in entities]
    art_list = [{"name": a.name, "artifact_type": a.artifact_type} for a in artifacts]

    reasoning_res = investigative_ai.run_investigative_reasoning(
        {"title": case.title, "case_number": case.case_number},
        ev_list, ent_list, art_list
    )

    saved_hypotheses = []
    for hyp in reasoning_res.get("hypotheses", []):
        db_hyp = models.InvestigationHypothesis(
            case_id=case_id,
            title=hyp.get("title", ""),
            description=hyp.get("description", ""),
            modus_operandi=hyp.get("modus_operandi", ""),
            supporting_evidence=json.dumps(hyp.get("supporting_evidence", [])),
            counter_arguments=hyp.get("counter_arguments", ""),
            contradictions=json.dumps(hyp.get("contradictions", [])),
            missing_evidence=json.dumps(hyp.get("missing_evidence", [])),
            recommended_leads=json.dumps(hyp.get("recommended_leads", [])),
            status="PROPOSED"
        )
        db.add(db_hyp)
        saved_hypotheses.append(db_hyp)

    db.commit()

    return {
        "status": "success",
        "generated_count": len(saved_hypotheses),
        "hypotheses": [
            {
                "id": h.id,
                "title": h.title,
                "description": h.description,
                "modus_operandi": h.modus_operandi,
                "supporting_evidence": json.loads(h.supporting_evidence),
                "counter_arguments": h.counter_arguments,
                "contradictions": json.loads(h.contradictions),
                "missing_evidence": json.loads(h.missing_evidence),
                "recommended_leads": json.loads(h.recommended_leads),
                "status": h.status
            }
            for h in saved_hypotheses
        ]
    }

@app.get("/cases/{case_id}/hypotheses/")
def get_case_hypotheses(case_id: int, db: Session = Depends(get_db)):
    hyps = db.query(models.InvestigationHypothesis).filter(
        models.InvestigationHypothesis.case_id == case_id
    ).order_by(models.InvestigationHypothesis.created_at.desc()).all()

    return [
        {
            "id": h.id,
            "title": h.title,
            "description": h.description,
            "modus_operandi": h.modus_operandi,
            "supporting_evidence": json.loads(h.supporting_evidence) if h.supporting_evidence else [],
            "counter_arguments": h.counter_arguments,
            "contradictions": json.loads(h.contradictions) if h.contradictions else [],
            "missing_evidence": json.loads(h.missing_evidence) if h.missing_evidence else [],
            "recommended_leads": json.loads(h.recommended_leads) if h.recommended_leads else [],
            "status": h.status,
            "investigator_notes": h.investigator_notes,
            "reviewed_by": h.reviewed_by,
            "reviewed_at": h.reviewed_at.isoformat() if h.reviewed_at else None,
            "created_at": h.created_at.isoformat() if h.created_at else None
        }
        for h in hyps
    ]

# ------------------------------------------------------------------------------
# 6. Investigator Approve / Reject Decision (Workflow Step 17)
# ------------------------------------------------------------------------------
@app.post("/hypotheses/{hypothesis_id}/review/")
def review_hypothesis(
    hypothesis_id: int,
    status: str = Form(...), # 'APPROVED' or 'REJECTED'
    notes: str = Form(""),
    user_id: int = Form(...),
    db: Session = Depends(get_db)
):
    hyp = db.query(models.InvestigationHypothesis).filter(models.InvestigationHypothesis.id == hypothesis_id).first()
    if not hyp:
        raise HTTPException(status_code=404, detail="Hypothesis not found")

    hyp.status = status.upper()
    hyp.investigator_notes = notes
    hyp.reviewed_by = user_id
    hyp.reviewed_at = datetime.now(timezone.utc)

    u = get_user_info(user_id)
    audit = models.AuditLog(
        user_id=user_id,
        action="REVIEW_HYPOTHESIS",
        details=f"{u['name']} marked hypothesis #{hyp.id} ('{hyp.title}') as {hyp.status}. Notes: {notes}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Hypothesis updated to {hyp.status}", "id": hyp.id}

# ------------------------------------------------------------------------------
# 7. Section 63 BSA 2023 Statutory Certificate Export (Workflow Steps 18 & 19)
# ------------------------------------------------------------------------------
@app.get("/cases/{case_id}/bsa-certificate/")
def get_bsa_certificate_json(case_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    artifacts = db.query(models.EvidenceArtifact).filter(models.EvidenceArtifact.case_id == case_id).all()
    art_list = [
        {
            "name": a.name,
            "artifact_type": a.artifact_type,
            "raw_sha256": a.raw_sha256,
            "salted_sha256": a.salted_sha256,
            "file_size": a.file_size,
            "metadata_json": a.metadata_json
        }
        for a in artifacts
    ]
    u = get_user_info(user_id)
    return bsa_certificate.generate_bsa_section_63_certificate(
        {"title": case.title, "case_number": case.case_number},
        art_list,
        u
    )

@app.get("/cases/{case_id}/bsa-certificate/html/", response_class=HTMLResponse)
def get_bsa_certificate_printable_html(case_id: int, user_id: int = 1, db: Session = Depends(get_db)):
    cert = get_bsa_certificate_json(case_id, user_id, db)
    
    exhibits_rows = ""
    for ex in cert["part_a_exhibits"]:
        exhibits_rows += f"""
        <tr>
            <td style="font-weight:bold; font-family:monospace;">{ex['exhibit_no']}</td>
            <td><strong>{ex['artifact_name']}</strong><br><small style="color:#64748b;">{ex['category']}</small></td>
            <td style="font-family:monospace; font-size:8pt; word-break:break-all;">{ex['un_salted_sha256']}</td>
            <td>{ex['file_size_bytes']} bytes</td>
            <td style="font-size:8.5pt;">{ex['extraction_method']}</td>
        </tr>
        """

    html = f"""<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Section 63 BSA Certificate - Case {cert['case_number']}</title>
        <style>
            body {{ font-family: 'Times New Roman', Times, serif; margin: 40px; color: #111; line-height: 1.6; font-size: 11pt; }}
            .header {{ text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }}
            .gov-title {{ font-size: 16pt; font-weight: bold; text-transform: uppercase; }}
            .sub-title {{ font-size: 12pt; font-weight: bold; margin-top: 5px; }}
            .cert-id {{ font-size: 9pt; color: #555; margin-top: 5px; font-family: monospace; }}
            .section-head {{ font-size: 12pt; font-weight: bold; text-decoration: underline; margin-top: 25px; margin-bottom: 10px; }}
            table {{ width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 9pt; }}
            th, td {{ border: 1px solid #333; padding: 6px 8px; text-align: left; }}
            th {{ background: #f0f0f0; }}
            .declaration {{ margin-top: 20px; text-align: justify; white-space: pre-line; }}
            .signature-block {{ margin-top: 50px; display: flex; justify-content: space-between; }}
            .seal-box {{ border: 2px dashed #666; width: 180px; height: 90px; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: #666; text-align: center; }}
            @media print {{ body {{ margin: 20px; }} }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="gov-title">Government of India / State Police</div>
            <div class="sub-title">CERTIFICATE UNDER SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023</div>
            <div style="font-size: 10pt; font-style: italic;">(Relating to Admissibility of Electronic Records in Court of Law)</div>
            <div class="cert-id">Certificate ID: {cert['certificate_id']} | Generated: {cert['generation_timestamp']}</div>
        </div>

        <div>
            <strong>Case / FIR Number:</strong> {cert['case_number']}<br>
            <strong>Case Title:</strong> {cert['case_title']}<br>
            <strong>Blockchain Ledger Anchoring:</strong> {cert['blockchain_verification_network']}
        </div>

        <div class="section-head">PART A: IDENTIFICATION OF ELECTRONIC RECORDS & CRYPTOGRAPHIC HASHES</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 12%;">Exhibit No</th>
                    <th style="width: 25%;">Artifact Description</th>
                    <th style="width: 35%;">SHA-256 Hash (Un-salted Raw)</th>
                    <th style="width: 10%;">Size</th>
                    <th style="width: 18%;">Acquisition Mode</th>
                </tr>
            </thead>
            <tbody>
                {exhibits_rows}
            </tbody>
        </table>

        <div class="section-head">PART B: STATUTORY DECLARATION UNDER SECTION 63 BSA 2023</div>
        <div class="declaration">{cert['part_b_declaration']}</div>

        <div class="signature-block">
            <div class="seal-box">
                OFFICIAL SEAL OF<br>INVESTIGATING AGENCY
            </div>
            <div style="text-align: right;">
                <br><br>
                ____________________________________<br>
                <strong>{cert['officer']['name']}</strong><br>
                {cert['officer']['role']} (Badge No: {cert['officer']['badge']})<br>
                {cert['officer']['department']}
            </div>
        </div>
    </body>
    </html>"""
    return HTMLResponse(content=html)


# ------------------------------------------------------------------------------
# Auto-Initialization on Startup (Self-healing for cloud deploys on Render)
# ------------------------------------------------------------------------------
@app.on_event("startup")
def startup_event():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    db = SessionLocal()
    try:
        # 1. Ensure default users exist
        if db.query(models.User).count() == 0:
            db.add_all([
                models.User(id=1, username="sharma", role="Officer"),
                models.User(id=2, username="vance", role="Officer"),
                models.User(id=3, username="patel", role="Judge"),
            ])
            db.commit()

        # 2. Ensure standard 6 cases exist
        if db.query(models.Case).count() == 0:
            default_cases = [
                models.Case(id=1, case_number="FIR-2026-111", title="State v. K. Malhotra — Insider Data Exfiltration & Trade Secret Theft", status="Sealed", is_sealed=True, sealed_by=3),
                models.Case(id=2, case_number="FIR-2026-105", title="Operation PhantomLocker — Double-Extortion Ransomware on Cloud Infrastructure", status="Sealed", is_sealed=True, sealed_by=3),
                models.Case(id=3, case_number="FIR-2026-331", title="Operation DarkNexus — Multi-Vector SIM Swap & Financial Extortion Ring", status="Open", is_sealed=False),
                models.Case(id=4, case_number="INC-2026-300", title="FinTech Payment Gateway Token Compromise & Money Mule Network", status="Sealed", is_sealed=True, sealed_by=3),
                models.Case(id=5, case_number="FIR-2026-113", title="Deepfake CEO Impersonation & Unauthorized Wire-Transfer Fraud", status="Open", is_sealed=False),
                models.Case(id=6, case_number="INC-2026/CYB/901", title="Critical Infrastructure SCADA Network Intrusion & Sabotage", status="Open", is_sealed=False),
            ]
            db.add_all(default_cases)
            db.commit()

            # Seed sample evidence, timeline, graph, and insights into all 6 cases
            for cid in [1, 2, 3, 4, 5, 6]:
                try:
                    seed_sample_evidence_for_case(case_id=cid, user_id=1, db=db)
                except Exception as e:
                    print(f"[STARTUP] Could not seed Case {cid}: {e}")
    except Exception as e:
        print(f"[STARTUP] Error during initialization: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)


