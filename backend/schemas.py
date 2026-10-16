from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class User(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True

class DocumentVersion(BaseModel):
    id: int
    version_number: int
    status: str
    file_path: str
    file_hash: str
    created_at: datetime
    uploaded_by: int
    extracted_text: Optional[str] = None
    ai_summary: Optional[str] = None
    entities: Optional[str] = None

    class Config:
        from_attributes = True

class Document(BaseModel):
    id: int
    name: str
    doc_type: str
    created_at: datetime
    versions: List[DocumentVersion] = []

    class Config:
        from_attributes = True

class CaseBase(BaseModel):
    case_number: str
    title: str

class CaseCreate(CaseBase):
    pass

class Case(CaseBase):
    id: int
    status: str
    is_sealed: bool = False
    sealed_by: Optional[int] = None
    sealed_at: Optional[datetime] = None
    created_at: datetime
    documents: List[Document] = []

    class Config:
        from_attributes = True

class AuditLog(BaseModel):
    id: int
    user_id: int
    action: str
    details: str
    timestamp: datetime

    class Config:
        from_attributes = True

# Forensic Schemas
class EvidenceArtifact(BaseModel):
    id: int
    case_id: int
    name: str
    artifact_type: str
    file_path: str
    raw_sha256: str
    salted_sha256: str
    file_size: int
    mime_type: str
    extracted_text: Optional[str] = None
    forgery_score: float = 0.0
    forgery_details: Optional[str] = None
    metadata_json: Optional[str] = None
    uploaded_by: int
    created_at: datetime

    class Config:
        from_attributes = True

class ForensicEvent(BaseModel):
    id: int
    case_id: int
    artifact_id: Optional[int] = None
    timestamp: str
    event_type: str
    description: str
    actor: Optional[str] = None
    target: Optional[str] = None
    severity: str = "INFO"
    is_anomaly: bool = False
    source: str

    class Config:
        from_attributes = True

class ForensicEntity(BaseModel):
    id: int
    case_id: int
    entity_type: str
    value: str
    occurrences: int
    first_seen: datetime

    class Config:
        from_attributes = True

class EntityLink(BaseModel):
    id: int
    case_id: int
    source_entity: str
    target_entity: str
    relation_type: str
    evidence_source: str
    confidence: float

    class Config:
        from_attributes = True

class InvestigationHypothesis(BaseModel):
    id: int
    case_id: int
    title: str
    description: str
    modus_operandi: str
    supporting_evidence: str
    counter_arguments: str
    contradictions: str
    missing_evidence: str
    recommended_leads: str
    status: str
    investigator_notes: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

