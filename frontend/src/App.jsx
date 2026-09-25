import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RecoveryDetail from './pages/RecoveryDetail';
import FileDetail from './pages/FileDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <header className="bg-blue-900 text-white p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wider">AI Data Recovery</h1>
            <nav>
              <ul className="flex space-x-4">
                <li><a href="/" className="hover:text-blue-300">Dashboard</a></li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/job/:jobId" element={<RecoveryDetail />} />
            <Route path="/job/:jobId/file/:fileId" element={<FileDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
