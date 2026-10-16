from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    role = Column(String)  # e.g., 'Officer', 'Reviewer', 'Judge'

class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, unique=True, index=True)
    title = Column(String)
    status = Column(String, default="Open")
    is_sealed = Column(Boolean, default=False)
    sealed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    sealed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    documents = relationship("Document", back_populates="case", cascade="all, delete-orphan")
    artifacts = relationship("EvidenceArtifact", back_populates="case", cascade="all, delete-orphan")
    events = relationship("ForensicEvent", back_populates="case", cascade="all, delete-orphan")
    entities = relationship("ForensicEntity", back_populates="case", cascade="all, delete-orphan")
    links = relationship("EntityLink", back_populates="case", cascade="all, delete-orphan")
    hypotheses = relationship("InvestigationHypothesis", back_populates="case", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    name = Column(String)
    doc_type = Column(String)  # e.g., 'FIR', 'Evidence'
    created_at = Column(DateTime, default=datetime.utcnow)
    case = relationship("Case", back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")

class DocumentVersion(Base):
    __tablename__ = "document_versions"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    version_number = Column(Integer)
    file_path = Column(String)  # Path in uploads/
    file_hash = Column(String)  # SHA-256
    status = Column(String) # 'Active', 'Superseded', 'Inactive'
    extracted_text = Column(Text, nullable=True)  # For AI Search + OCR Preview
    ai_summary = Column(Text, nullable=True)
    entities = Column(Text, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    document = relationship("Document", back_populates="versions")
    images = relationship("DocumentImage", back_populates="version", cascade="all, delete-orphan")

class DocumentImage(Base):
    __tablename__ = "document_images"
    id = Column(Integer, primary_key=True, index=True)
    document_version_id = Column(Integer, ForeignKey("document_versions.id"))
    image_path = Column(String)   # filename inside uploads/ folder
    page_number = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    version = relationship("DocumentVersion", back_populates="images")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String) # e.g., 'UPLOAD_DOCUMENT', 'CREATE_VERSION'
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

# ==============================================================================
# SUTRAM 2026 DFIR FORENSICS EXTENSIONS
# ==============================================================================

class EvidenceArtifact(Base):
    """
    Format-agnostic evidence container preserving legal chain of custody.
    Holds un-salted SHA-256 for BSA 63 court admissibility and salted SHA-256 for blockchain.
    """
    __tablename__ = "evidence_artifacts"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    name = Column(String)
    artifact_type = Column(String)  # 'DOCUMENT', 'MOBILE_DB', 'NETWORK_LOG', 'CHAT_EXPORT', 'MEDIA'
    file_path = Column(String)      # Filename in uploads/
    raw_sha256 = Column(String)     # Standard cryptographic hash for court & Section 63 BSA
    salted_sha256 = Column(String)  # Salted hash registered to Polygon blockchain
    file_size = Column(Integer, default=0)
    mime_type = Column(String, default="application/octet-stream")
    extracted_text = Column(Text, nullable=True)
    forgery_score = Column(Float, default=0.0)      # Tamper Risk Score (0 - 100%)
    forgery_details = Column(Text, nullable=True)    # JSON string containing ELA results and flags
    metadata_json = Column(Text, nullable=True)      # JSON string with EXIF, GPS, device signatures
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="artifacts")
    events = relationship("ForensicEvent", back_populates="artifact", cascade="all, delete-orphan")

class ForensicEvent(Base):
    """
    Normalized chronological event extracted from logs, mobile DBs, chats, and exhibits.
    """
    __tablename__ = "forensic_events"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    artifact_id = Column(Integer, ForeignKey("evidence_artifacts.id"), nullable=True)
    timestamp = Column(String)      # Normalized UTC ISO string e.g. "2026-10-09T14:22:10Z"
    event_type = Column(String)     # 'AUTH_FAILURE', 'NETWORK_FLOW', 'CHAT_MESSAGE', 'FINANCIAL_TX', 'FILE_MOD'
    description = Column(Text)
    actor = Column(String, nullable=True)   # Source IP, User, Phone number, Complainant
    target = Column(String, nullable=True)  # Destination IP, Port, Recipient, UPI ID
    severity = Column(String, default="INFO") # 'INFO', 'WARNING', 'CRITICAL'
    is_anomaly = Column(Boolean, default=False) # Flagged by ML Isolation Forest
    source = Column(String)         # Name of source file

    case = relationship("Case", back_populates="events")
    artifact = relationship("EvidenceArtifact", back_populates="events")

class ForensicEntity(Base):
    """
    Named entities extracted from evidence for relationship correlation.
    """
    __tablename__ = "forensic_entities"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    entity_type = Column(String)    # 'PHONE', 'UPI_ID', 'IP_ADDRESS', 'EMAIL', 'PERSON', 'BANK_ACC', 'CRYPTO'
    value = Column(String)          # e.g., "+919876543210", "fraudster@okhdfcbank"
    occurrences = Column(Integer, default=1)
    first_seen = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="entities")

class EntityLink(Base):
    """
    Knowledge graph edge linking two forensic entities or an entity to an exhibit.
    """
    __tablename__ = "entity_links"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    source_entity = Column(String)  # Entity value
    target_entity = Column(String)  # Entity value
    relation_type = Column(String)  # 'TRANSACTED_WITH', 'COMMUNICATED_WITH', 'CO_OCCURS', 'ACCESSED_FROM'
    evidence_source = Column(String) # Exhibit name where link was detected
    confidence = Column(Float, default=1.0)

    case = relationship("Case", back_populates="links")

class InvestigationHypothesis(Base):
    """
    AI-synthesized hypotheses with adversarial challenges, contradictions,
    and Investigator-in-the-Loop review state.
    """
    __tablename__ = "investigation_hypotheses"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    title = Column(String)
    description = Column(Text)
    modus_operandi = Column(Text)
    supporting_evidence = Column(Text)  # JSON array of strings
    counter_arguments = Column(Text)    # Adversarial Devil's Advocate reasoning
    contradictions = Column(Text)       # JSON array of detected discrepancies
    missing_evidence = Column(Text)     # JSON array of identified gaps
    recommended_leads = Column(Text)    # JSON array of actionable leads
    status = Column(String, default="PROPOSED") # 'PROPOSED', 'APPROVED', 'REJECTED'
    investigator_notes = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="hypotheses")
