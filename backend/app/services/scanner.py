import time
import math
import uuid
import datetime
import json
from sqlalchemy.orm import Session
from ..models.database import SessionLocal
from ..models.models import RecoveryJob, Fragment, RecoveredFile, FragmentRelationship

def calculate_entropy(data: bytes) -> float:
    if not data:
        return 0
    entropy = 0
    for x in range(256):
        p_x = float(data.count(x))/len(data)
        if p_x > 0:
            entropy += - p_x*math.log(p_x, 2)
    return entropy

def process_recovery_job(job_id: str, file_path: str):
    db = SessionLocal()
    try:
        # Simulate processing time
        time.sleep(1)
        
        # Read the file
        with open(file_path, "rb") as f:
            data = f.read()
            
        total_size = len(data)
        chunk_size = 1024 # 1KB chunks for prototype
        
        fragments = []
        # Chunking
        for i in range(0, total_size, chunk_size):
            chunk = data[i:i+chunk_size]
            frag_id = f"{job_id[:8]}_F{i//chunk_size:04d}"
            entropy = calculate_entropy(chunk)
            
            # Simple mock signature detection
            signature = None
            pred_type = "UNKNOWN"
            conf = 0.5
            
            if b"%PDF" in chunk[:10]:
                signature = "PDF"
                pred_type = "PDF"
                conf = 0.95
            elif b"\xff\xd8\xff" in chunk[:10]:
                signature = "JPEG"
                pred_type = "JPEG"
                conf = 0.99
            elif b"PK" in chunk[:10]:
                signature = "ZIP"
                pred_type = "ZIP"
                conf = 0.90
            elif entropy > 7.5:
                pred_type = "ENCRYPTED_OR_COMPRESSED"
                conf = 0.8
            elif entropy < 1.0:
                pred_type = "EMPTY_SPACE"
                conf = 0.99
                
            frag = Fragment(
                id=frag_id,
                recovery_job_id=job_id,
                offset=i,
                size=len(chunk),
                entropy=entropy,
                signature=signature,
                predicted_type=pred_type,
                classification_confidence=conf
            )
            fragments.append(frag)
            db.add(frag)
            
        db.commit()
        
        # Mock Fragment Relationship & Reconstruction
        # We'll just group sequential blocks of same type
        current_file_fragments = []
        current_type = None
        
        for frag in fragments:
            if frag.predicted_type not in ["UNKNOWN", "EMPTY_SPACE"]:
                if current_type is None:
                    current_type = frag.predicted_type
                    current_file_fragments.append(frag.id)
                elif current_type == frag.predicted_type:
                    current_file_fragments.append(frag.id)
                else:
                    save_recovered_file(job_id, current_type, current_file_fragments, db)
                    current_type = frag.predicted_type
                    current_file_fragments = [frag.id]
            else:
                if current_type is not None:
                    save_recovered_file(job_id, current_type, current_file_fragments, db)
                    current_type = None
                    current_file_fragments = []
                    
        if current_type is not None:
            save_recovered_file(job_id, current_type, current_file_fragments, db)
            
        job = db.query(RecoveryJob).filter(RecoveryJob.id == job_id).first()
        if job:
            job.status = "COMPLETED"
            job.completed_at = datetime.datetime.now(datetime.timezone.utc)
            db.commit()
        
    except Exception as e:
        try:
            job = db.query(RecoveryJob).filter(RecoveryJob.id == job_id).first()
            if job:
                job.status = f"FAILED: {str(e)}"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()

def save_recovered_file(job_id, file_type, fragment_ids, db):
    file_id = str(uuid.uuid4())
    completeness = 80.0 + (len(fragment_ids) * 2 % 20) # Mock
    confidence = 70.0 + (len(fragment_ids) * 5 % 30) # Mock
    priority = "HIGH" if confidence > 90 else "MEDIUM"
    status = "LIKELY_VIEWABLE" if completeness > 85 else "PARTIALLY_RECOVERABLE"
    
    rec_file = RecoveredFile(
        id=file_id,
        recovery_job_id=job_id,
        filename=f"recovered_{file_id[:8]}.{file_type.lower()}",
        file_type=file_type,
        recovered_size=len(fragment_ids) * 1024,
        estimated_size=len(fragment_ids) * 1024 + 500,
        completeness=completeness,
        integrity="HIGH" if completeness > 90 else "MEDIUM",
        recovery_confidence=confidence,
        priority=priority,
        status=status,
        output_path="",
        fragment_ids=json.dumps(fragment_ids)
    )
    db.add(rec_file)
    db.commit()
