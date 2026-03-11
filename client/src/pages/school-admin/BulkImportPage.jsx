import React, { useMemo, useRef, useState } from 'react';
import axios from 'axios';

const CSV_HEADERS = ['name', 'email', 'grade', 'class', 'rollNumber', 'parentEmail', 'parentPhone'];

const templateRows = [
  CSV_HEADERS.join(','),
  'Arjun Sharma,arjun.sharma@school.edu,9,A,21,parent1@example.com,9876543210',
  'Priya Patel,priya.patel@school.edu,8,B,14,parent2@example.com,9123456789'
].join('\n');

const parsePreview = (text) => {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1, 11).map((line) => {
    const cols = line.split(',');
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] || '').trim();
    });
    return row;
  });
};

const BulkImportPage = () => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const previewRows = useMemo(() => parsePreview(csvText), [csvText]);

  const downloadTemplate = () => {
    const blob = new Blob([templateRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecokids-bulk-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (selected) => {
    if (!selected) return;
    setFile(selected);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setCsvText(e.target?.result || '');
    };
    reader.readAsText(selected);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    handleFile(dropped);
  };

  const uploadCSV = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(10);
    setResult(null);

    try {
      const form = new FormData();
      form.append('file', file);

      setProgress(40);
      const response = await axios.post('/api/v1/school-admin/students/bulk-import', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProgress(100);
      setResult(response.data);
    } catch (error) {
      setResult({
        success: false,
        message: error?.response?.data?.message || 'Upload failed',
        errorReport: error?.response?.data?.errorReport || []
      });
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Student Import</h1>
        <p className="text-gray-600 mt-2">Upload CSV for 500+ students with automatic temp password generation.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Download CSV Template
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-black"
          >
            Select CSV File
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="rounded-xl border-2 border-dashed border-green-300 bg-green-50 p-8 text-center"
        >
          <p className="text-green-700 font-semibold">Drag & drop CSV here</p>
          <p className="text-sm text-gray-500 mt-1">Required columns: {CSV_HEADERS.join(', ')}</p>
        </div>

        {file && (
          <div className="text-sm text-gray-700">
            Selected file: <span className="font-semibold">{file.name}</span>
          </div>
        )}

        <div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Progress: {progress}%</p>
        </div>

        <button
          onClick={uploadCSV}
          disabled={!file || loading}
          className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-bold disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload & Import'}
        </button>
      </div>

      {previewRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Preview (first 10 rows)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  {CSV_HEADERS.map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {CSV_HEADERS.map((h) => (
                      <td key={`${i}-${h}`} className="px-3 py-2 text-gray-700">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && (
        <div className={`rounded-2xl p-4 border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-700'}`}>{result.message || 'Import result'}</p>
          {result.success && (
            <div className="mt-2 text-sm text-gray-700">
              <p>Created: {result.createdCount}</p>
              <p>Failed: {result.failedCount}</p>
            </div>
          )}
          {Array.isArray(result.errorReport) && result.errorReport.length > 0 && (
            <div className="mt-3 text-sm text-red-700 max-h-52 overflow-auto">
              {result.errorReport.slice(0, 30).map((e, idx) => (
                <p key={idx}>Row {e.row}: {e.error}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkImportPage;
