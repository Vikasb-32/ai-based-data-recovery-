from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models.database import engine, Base
from .api import routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Data Recovery API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for hackathon prototype
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api/recovery")

@app.get("/")
def root():
    return {"message": "AI Data Recovery API is running."}
