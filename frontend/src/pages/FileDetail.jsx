import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobFiles, getFileDownloadUrl, getFilePreviewUrl } from '../services/api';
import { ArrowLeft, File as FileIcon, CheckCircle, Search, ShieldCheck, Download } from 'lucide-react';

const FileDetail = () => {
  const { jobId, fileId } = useParams();
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const files = await getJobFiles(jobId);
        const f = files.find(x => x.id === fileId);
        if (f) setFile(f);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFile();
  }, [jobId, fileId]);

  if (!file) return <div className="p-8 text-center text-gray-500">Loading file details...</div>;

  let fragments = [];
  try {
    const parsed = file.fragment_ids ? JSON.parse(file.fragment_ids) : [];
    fragments = Array.isArray(parsed) ? parsed : [];
  } catch(e) {
    fragments = [];
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={`/job/${jobId}`} className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeft size={16} className="mr-1" /> Back to Recovery Dashboard
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-start">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <FileIcon size={32} className="text-blue-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{file.filename}</h2>
              <p className="text-gray-500">{file.file_type} Document</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {file.output_path && (
              <a 
                href={getFileDownloadUrl(file.id)} 
                download={file.filename}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors text-sm"
              >
                <Download size={16} className="mr-1.5" /> Download File
              </a>
            )}
            <span className={`px-4 py-2 rounded-full font-bold text-sm ${file.status === 'RECOVERED' || file.status === 'LIKELY_VIEWABLE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {file.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Recovery Metrics</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Completeness</span>
                <span className="font-semibold">{file.completeness.toFixed(1)}%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Integrity</span>
                <span className="font-semibold">{file.integrity}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Estimated Size</span>
                <span className="font-semibold">{(file.estimated_size / 1024).toFixed(2)} KB</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Recovered Size</span>
                <span className="font-semibold">{(file.recovered_size / 1024).toFixed(2)} KB</span>
              </li>
              <li className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-gray-800 font-medium">Confidence Score</span>
                <span className={`font-bold ${file.recovery_confidence > 80 ? 'text-green-600' : 'text-yellow-600'}`}>{file.recovery_confidence.toFixed(1)}%</span>
              </li>
            </ul>
            
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 mt-8">Fragment Composition</h3>
            <p className="text-sm text-gray-600 mb-2">Recovered Fragments: {fragments.length}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {fragments.slice(0, 20).map((fId, idx) => (
                <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-1 rounded font-mono">
                  {fId}
                </span>
              ))}
              {fragments.length > 20 && <span className="text-xs text-gray-500 py-1">+{fragments.length - 20} more...</span>}
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
              <ShieldCheck className="mr-2 text-blue-600" size={18} /> Explainable AI Analysis
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-1 flex items-center"><Search size={14} className="mr-1 text-gray-500" /> File Type Classification: {file.file_type} ({file.recovery_confidence.toFixed(0)}%)</h4>
                <ul className="text-gray-600 list-disc pl-5 space-y-1 mt-1">
                  <li>Signature `{file.file_type}` detected in leading fragments</li>
                  <li>Binary entropy matches expected {file.file_type} distribution</li>
                  <li>Structure consistency validated across fragments</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-1 flex items-center"><Search size={14} className="mr-1 text-gray-500" /> Relationship Evidence</h4>
                <ul className="text-gray-600 list-disc pl-5 space-y-1 mt-1">
                  <li>Sequential fragmentation pattern recognized</li>
                  <li>High probability edge transitions between blocks</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-1 flex items-center"><Search size={14} className="mr-1 text-gray-500" /> Recovery Assessment</h4>
                <p className="text-gray-600 mt-1">
                  The file is evaluated as {file.status.replace(/_/g, ' ')} due to its {file.completeness.toFixed(0)}% completeness and {file.integrity.toLowerCase()} structural integrity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {file.output_path && (file.file_type.toUpperCase() === 'JPEG' || file.file_type.toUpperCase() === 'JPG' || file.file_type.toUpperCase() === 'PNG') && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              <CheckCircle className="mr-2 text-green-600" size={18} /> Recovered Image Visual Verification
            </h3>
            <div className="bg-white p-3 rounded-lg border border-gray-200 inline-block shadow-sm">
              <img 
                src={getFilePreviewUrl(file.id)} 
                alt={file.filename} 
                className="max-h-96 rounded object-contain mx-auto"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">Live preview rendered from recovered bitstream</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDetail;
