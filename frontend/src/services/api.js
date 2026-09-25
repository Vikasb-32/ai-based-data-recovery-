const API_URL = 'http://localhost:8000/api/recovery';

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
};

export const startAnalysis = async (jobId) => {
  const response = await fetch(`${API_URL}/${jobId}/start`, { method: 'POST' });
  if (!response.ok) throw new Error('Start analysis failed');
  return response.json();
};

export const getJobStatus = async (jobId) => {
  const response = await fetch(`${API_URL}/${jobId}/status`);
  if (!response.ok) throw new Error('Get status failed');
  return response.json();
};

export const getJobFiles = async (jobId) => {
  const response = await fetch(`${API_URL}/${jobId}/files`);
  if (!response.ok) throw new Error('Get files failed');
  return response.json();
};

export const getJobFragments = async (jobId) => {
  const response = await fetch(`${API_URL}/${jobId}/fragments`);
  if (!response.ok) throw new Error('Get fragments failed');
  return response.json();
};
