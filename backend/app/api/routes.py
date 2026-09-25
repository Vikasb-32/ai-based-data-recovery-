from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from ..models.database import get_db
from ..models.models import RecoveryJob, Fragment, RecoveredFile
from ..schemas import schemas
from ..services import scanner
import uuid
import hashlib
import os

from pathlib import Path

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = str(BASE_DIR / "datasets" / "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.RecoveryJob)
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    job_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    file_hash = hashlib.sha256(content).hexdigest()
    
    job = RecoveryJob(
        id=job_id,
        input_filename=file.filename,
        input_hash=file_hash,
        input_size=len(content),
        status="UPLOADED"
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Store filepath somewhere temporarily, maybe just reconstruct from job_id and filename
    # Or start analysis directly
    return job

@router.post("/{job_id}/start")
async def start_analysis(job_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    job = db.query(RecoveryJob).filter(RecoveryJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    file_path = os.path.join(UPLOAD_DIR, f"{job.id}_{job.input_filename}")
    
    job.status = "PROCESSING"
    db.commit()
    
    background_tasks.add_task(scanner.process_recovery_job, job_id, file_path)
    return {"message": "Analysis started"}

@router.get("/{job_id}/status")
def get_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(RecoveryJob).filter(RecoveryJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": job.status, "completed_at": job.completed_at}

@router.get("/{job_id}/fragments", response_model=list[schemas.Fragment])
def get_fragments(job_id: str, db: Session = Depends(get_db)):
    fragments = db.query(Fragment).filter(Fragment.recovery_job_id == job_id).all()
    return fragments

@router.get("/{job_id}/files", response_model=list[schemas.RecoveredFile])
def get_files(job_id: str, db: Session = Depends(get_db)):
    files = db.query(RecoveredFile).filter(RecoveredFile.recovery_job_id == job_id).all()
    return files
