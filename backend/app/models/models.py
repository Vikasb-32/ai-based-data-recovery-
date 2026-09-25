from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class RecoveryJob(Base):
    __tablename__ = "recovery_jobs"

    id = Column(String, primary_key=True, index=True)
    input_filename = Column(String)
    input_hash = Column(String)
    input_size = Column(Integer)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    fragments = relationship("Fragment", back_populates="job")
    recovered_files = relationship("RecoveredFile", back_populates="job")

class Fragment(Base):
    __tablename__ = "fragments"

    id = Column(String, primary_key=True, index=True)
    recovery_job_id = Column(String, ForeignKey("recovery_jobs.id"))
    offset = Column(Integer)
    size = Column(Integer)
    entropy = Column(Float)
    signature = Column(String, nullable=True)
    predicted_type = Column(String, nullable=True)
    classification_confidence = Column(Float, nullable=True)

    job = relationship("RecoveryJob", back_populates="fragments")

class FragmentRelationship(Base):
    __tablename__ = "fragment_relationships"

    id = Column(Integer, primary_key=True, index=True)
    recovery_job_id = Column(String, ForeignKey("recovery_jobs.id"))
    fragment_a = Column(String)
    fragment_b = Column(String)
    relationship_score = Column(Float)
    evidence = Column(String)

class RecoveredFile(Base):
    __tablename__ = "recovered_files"

    id = Column(String, primary_key=True, index=True)
    recovery_job_id = Column(String, ForeignKey("recovery_jobs.id"))
    filename = Column(String)
    file_type = Column(String)
    recovered_size = Column(Integer)
    estimated_size = Column(Integer, nullable=True)
    completeness = Column(Float)
    integrity = Column(String)
    recovery_confidence = Column(Float)
    priority = Column(String)
    status = Column(String)
    output_path = Column(String)
    fragment_ids = Column(String) # JSON list of fragment IDs
    
    job = relationship("RecoveryJob", back_populates="recovered_files")
