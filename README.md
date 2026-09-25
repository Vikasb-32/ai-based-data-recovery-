# AI-Assisted Intelligent Data Recovery and Analysis System

## Problem Statement
Traditional data recovery software operates by searching for common file signatures (headers/footers) to carve files out of damaged or unallocated space. However, when storage media is heavily fragmented, corrupted, or missing metadata, standard signature scanning fails or produces partially broken files without any explanation. 

## Project Motivation
To build an AI-powered data recovery solution that intelligently identifies, reconstructs, classifies, and prioritizes recoverable digital information from damaged, deleted, or partially corrupted storage data. It moves beyond "finding a file" to intelligently analyzing the *usability* and *integrity* of the fragments found.

## How the system works
1. **Data Acquisition**: Reads damaged disk images or datasets in a read-only manner.
2. **Fragment Detection**: Divides raw storage into fragments, detecting structure, entropy, and file signatures.
3. **AI Classification**: Uses characteristic byte analysis to predict likely file types for unknown fragments.
4. **Fragment Relationship**: Determines edge-compatibility between fragments to logically group them.
5. **Reconstruction**: Reassembles related fragments into files.
6. **Assessment**: Evaluates completeness, integrity, and recoverability confidence.

## Architecture
The system employs a React frontend with a FastAPI Python backend, processing datasets sequentially.
- **Frontend**: React + Vite, Tailwind CSS, Recharts
- **Backend**: FastAPI, Python 3, SQLite

## AI/ML Methodology
Hybrid Intelligence: We use deterministic digital forensics where possible (magic numbers, structural validation) combined with AI probabilistic scoring for uncertain fragments (entropy pattern matching, fragment sequence probability).

## Project Structure
```
hackathon/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/routes.py
│   │   ├── models/database.py, models.py
│   │   ├── schemas/schemas.py
│   │   └── services/scanner.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── pages/Dashboard.jsx, RecoveryDetail.jsx, FileDetail.jsx
    │   └── services/api.js
    └── package.json
```

## Installation

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Demo Mode
Since we don't always have access to a real corrupted physical drive, the system features a **Demo Dataset** mode. You can click "Run Demo Dataset" in the frontend to feed an intentionally fragmented mock payload into the scanner, simulating the reconstruction process and displaying the results.

## Limitations
- This is a prototype and not certified forensic software.
- The AI predictions are estimates, not guarantees of perfect file integrity.
- Recovered sizes and completeness are heuristically estimated.

## Future Improvements
- Deep learning-based binary sequence classification for better fragment prediction.
- Support for physical block devices (read-only mode).
- OCR on partially recovered document fragments.
- Explainable graph neural networks to visualize relationships better.
