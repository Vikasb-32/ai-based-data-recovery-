from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FragmentBase(BaseModel):
    id: str
    offset: int
    size: int
    entropy: float
    signature: Optional[str]
    predicted_type: Optional[str]
    classification_confidence: Optional[float]

class Fragment(FragmentBase):
    recovery_job_id: str
    class Config:
        from_attributes = True

class RecoveredFileBase(BaseModel):
    id: str
    filename: str
    file_type: str
    recovered_size: int
    estimated_size: Optional[int]
    completeness: float
    integrity: str
    recovery_confidence: float
    priority: str
    status: str
    fragment_ids: str # json string

class RecoveredFile(RecoveredFileBase):
    recovery_job_id: str
    class Config:
        from_attributes = True

class RecoveryJobBase(BaseModel):
    id: str
    input_filename: str
    input_hash: str
    input_size: int
    status: str

class RecoveryJob(RecoveryJobBase):
    created_at: datetime
    completed_at: Optional[datetime]
    fragments: List[Fragment] = []
    recovered_files: List[RecoveredFile] = []
    class Config:
        from_attributes = True

class FragmentRelationshipBase(BaseModel):
    fragment_a: str
    fragment_b: str
    relationship_score: float
    evidence: str

class FragmentRelationship(FragmentRelationshipBase):
    id: int
    recovery_job_id: str
    class Config:
        from_attributes = True
