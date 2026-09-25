import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileSearch, AlertTriangle } from 'lucide-react';
import { uploadFile, startAnalysis } from '../services/api';

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const job = await uploadFile(file);
      await startAnalysis(job.id);
      navigate(`/job/${job.id}`);
    } catch (err) {
      setError(err.message || 'Failed to start recovery process.');
      setUploading(false);
    }
  };

  const handleDemo = async () => {
    setUploading(true);
    setError('');
    try {
      // Create multi-block mock drive image (5 blocks x 1024 bytes)
      const buffer = new Uint8Array(5 * 1024);
      // Chunk 0: PDF
      const pdfHeader = new TextEncoder().encode("%PDF-1.4 Mock Document Fragment Content");
      buffer.set(pdfHeader, 0);
      // Chunk 1: JPEG
      buffer[1024] = 0xff; buffer[1025] = 0xd8; buffer[1026] = 0xff; buffer[1027] = 0xe0;
      // Chunk 2: ZIP
      const zipHeader = new TextEncoder().encode("PK\x03\x04 Mock Archive Fragment Content");
      buffer.set(zipHeader, 2048);
      // Chunk 3: High entropy (simulating compressed/encrypted)
      for (let i = 3072; i < 4096; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
      // Chunk 4: Empty space (already zeroes)

      const demoBlob = new Blob([buffer], { type: 'application/octet-stream' });
      const demoFile = new File([demoBlob], "demo_damaged_drive.img");
      const job = await uploadFile(demoFile);
      await startAnalysis(job.id);
      navigate(`/job/${job.id}`);
    } catch (err) {
      setError(err.message || 'Demo failed.');
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">New Recovery Job</h2>
        <p className="text-center text-gray-500 mb-8">Upload a disk image or binary dataset to begin intelligent analysis.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
            <AlertTriangle className="mr-2 mt-0.5" size={18} />
            <p>{error}</p>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:bg-gray-50 transition-colors">
          <UploadCloud className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-2">Drag and drop your file here, or</p>
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            onChange={handleFileChange} 
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors inline-block"
          >
            Browse Files
          </label>
          {file && (
            <p className="mt-4 text-sm text-green-600 font-medium border border-green-200 bg-green-50 rounded p-2 inline-block">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col space-y-4">
          <button 
            className={`w-full py-3 rounded font-semibold text-lg flex items-center justify-center transition-colors ${file && !uploading ? 'bg-blue-900 text-white hover:bg-blue-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            disabled={!file || uploading}
            onClick={handleUpload}
          >
            {uploading ? 'Processing...' : <><FileSearch className="mr-2" size={20} /> Start Analysis</>}
          </button>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button 
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-lg transition-colors border border-gray-300"
            onClick={handleDemo}
            disabled={uploading}
          >
            Run Demo Dataset
          </button>
        </div>
      </div>
      
      <div className="mt-12 w-full max-w-4xl">
        <h3 className="text-xl font-bold mb-4 text-gray-700 border-b pb-2">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h4 className="font-bold text-blue-900 mb-2">1. Fragment Detection</h4>
            <p className="text-gray-600 text-sm">The system scans the raw storage data and extracts binary fragments, detecting file signatures and entropy.</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h4 className="font-bold text-blue-900 mb-2">2. AI Classification</h4>
            <p className="text-gray-600 text-sm">An ML model predicts the most likely file type for unknown fragments based on byte characteristics.</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h4 className="font-bold text-blue-900 mb-2">3. Reconstruction</h4>
            <p className="text-gray-600 text-sm">Fragments are logically grouped and reassembled. The system scores integrity, completeness, and recovery confidence.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
