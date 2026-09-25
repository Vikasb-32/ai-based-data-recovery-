import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobStatus, getJobFiles, getJobFragments, getFileDownloadUrl } from '../services/api';
import { CheckCircle, AlertCircle, Clock, ShieldCheck, Download, RefreshCw, BarChart2, FileText, Settings, Cpu, Link as LinkIcon, Database } from 'lucide-react';

const RecoveryDetail = () => {
  const { jobId } = useParams();
  const [status, setStatus] = useState('PENDING');
  const [files, setFiles] = useState([]);
  const [fragments, setFragments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;
    const fetchStatus = async () => {
      try {
        const res = await getJobStatus(jobId);
        setStatus(res.status);
        if (res.status === 'COMPLETED' || res.status.startsWith('FAILED')) {
          clearInterval(interval);
          if (res.status === 'COMPLETED') {
            const filesRes = await getJobFiles(jobId);
            setFiles(filesRes);
            const fragsRes = await getJobFragments(jobId);
            setFragments(fragsRes);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  if (loading && status !== 'COMPLETED' && !status.startsWith('FAILED')) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="animate-spin text-blue-600 mb-6" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Storage Data</h2>
        <p className="text-gray-500 mb-6 max-w-md text-center">
          The AI engine is currently scanning binary fragments, classifying unknown data, and attempting reconstruction.
        </p>
        
        <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Database className="mr-2" size={16} /> <span>Extracting fragments...</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Cpu className="mr-2" size={16} /> <span>Classifying signatures...</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2 opacity-50">
            <LinkIcon className="mr-2" size={16} /> <span>Analyzing relationships...</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 opacity-30">
            <FileText className="mr-2" size={16} /> <span>Reconstructing files...</span>
          </div>
        </div>
      </div>
    );
  }

  const highConfidenceCount = files.filter(f => f.recovery_confidence > 80).length;
  const partialCount = files.filter(f => f.recovery_confidence > 40 && f.recovery_confidence <= 80).length;
  const unrecoverableCount = files.filter(f => f.recovery_confidence <= 40).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Recovery Dashboard</h2>
          <p className="text-gray-500">Job ID: {jobId}</p>
        </div>
        <button className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded text-gray-700 hover:bg-gray-50 transition-colors">
          <Download className="mr-2" size={18} /> Generate Report
        </button>
      </div>

      {status.startsWith('FAILED') && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start rounded">
          <AlertCircle className="mr-2 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="font-semibold">Analysis Failed</p>
            <p className="text-sm mt-1">{status}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <div className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wider">Total Fragments</div>
          <div className="text-3xl font-bold text-blue-900">{fragments.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <div className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wider">Potential Files</div>
          <div className="text-3xl font-bold text-blue-700">{files.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200 bg-green-50 flex flex-col items-center justify-center">
          <div className="text-green-700 text-sm font-semibold mb-1 uppercase tracking-wider flex items-center"><CheckCircle className="mr-1" size={14}/> High Confidence</div>
          <div className="text-3xl font-bold text-green-700">{highConfidenceCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-yellow-200 bg-yellow-50 flex flex-col items-center justify-center">
          <div className="text-yellow-700 text-sm font-semibold mb-1 uppercase tracking-wider flex items-center"><AlertCircle className="mr-1" size={14}/> Partial</div>
          <div className="text-3xl font-bold text-yellow-700">{partialCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-red-200 bg-red-50 flex flex-col items-center justify-center">
          <div className="text-red-700 text-sm font-semibold mb-1 uppercase tracking-wider flex items-center"><Clock className="mr-1" size={14}/> Unrecoverable</div>
          <div className="text-3xl font-bold text-red-700">{unrecoverableCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Recovered Files Table</h3>
          <div className="text-sm text-gray-500 flex items-center">
            <ShieldCheck className="mr-1" size={16} /> Intelligently sorted by Technical Priority
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">File</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Completeness</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Integrity</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...files].sort((a, b) => b.recovery_confidence - a.recovery_confidence).map((file) => (
                <tr key={file.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/job/${jobId}/file/${file.id}`} className="font-medium text-blue-600 hover:underline">
                      {file.filename}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">{file.file_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm">{file.completeness.toFixed(1)}%</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${file.completeness > 80 ? 'bg-green-500' : file.completeness > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${file.completeness}%`}}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{file.integrity}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${file.recovery_confidence > 80 ? 'text-green-600' : file.recovery_confidence > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {file.recovery_confidence.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${file.priority === 'HIGH' ? 'border-red-200 text-red-700 bg-red-50' : file.priority === 'MEDIUM' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 'border-gray-200 text-gray-700 bg-gray-50'}`}>
                      {file.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{file.status.replace(/_/g, ' ')}</span>
                    {file.output_path && (
                      <a 
                        href={getFileDownloadUrl(file.id)} 
                        download={file.filename}
                        className="ml-3 inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200"
                        title="Download recovered file"
                      >
                        <Download size={12} className="mr-1" /> Save
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No files could be reconstructed from the provided data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecoveryDetail;
