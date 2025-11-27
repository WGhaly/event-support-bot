'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ParsedData {
  columns: string[];
  rows: Record<string, string | number>[];
  rowCount: number;
}

export default function NewDatasetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    setError('');
    setParsedData(null);

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.endsWith('.csv') && 
        !selectedFile.name.endsWith('.xlsx')) {
      setError('Please upload a CSV or Excel (.xlsx) file');
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);

    // Auto-set name from filename
    if (!name) {
      const fileName = selectedFile.name.replace(/\.(csv|xlsx)$/i, '');
      setName(fileName);
    }

    // Parse file for preview
    try {
      const text = await selectedFile.text();
      const Papa = (await import('papaparse')).default;
      
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });

      if (result.errors.length > 0) {
        setError(`Parse error: ${result.errors[0].message}`);
        return;
      }

      if (result.data.length === 0) {
        setError('File appears to be empty');
        return;
      }

      if (result.data.length > 10000) {
        setError('File has more than 10,000 rows. Please reduce the data size.');
        return;
      }

      const columns = result.meta.fields || [];
      if (columns.length === 0) {
        setError('No columns found in file');
        return;
      }

      setParsedData({
        columns,
        rows: result.data as Record<string, string | number>[],
        rowCount: result.data.length,
      });
    } catch (err) {
      console.error('Parse error:', err);
      setError('Failed to parse file. Please check the file format.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !name || !parsedData) {
      setError('Please select a file and provide a name');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('projectId', projectId);

      const response = await fetch('/api/datasets', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/dashboard/projects/${projectId}`);
      } else {
        setError(data.error?.userMessage || 'Failed to upload dataset');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload dataset. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to project
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Import Dataset</h1>
          <p className="mt-2 text-gray-600">
            Upload a CSV or Excel file with your badge data
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dataset Name */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Dataset Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Conference Attendees 2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* File Upload Area */}
          <div
            className={`bg-white rounded-lg shadow-sm border-2 border-dashed p-8 text-center transition ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Click to upload
                </label>
                <span className="text-gray-600"> or drag and drop</span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500">
                CSV or Excel (.xlsx) up to 5MB
              </p>
              {file && (
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="font-medium">{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Data Preview */}
          {parsedData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Data Preview
              </h2>
              <div className="mb-4 flex items-center space-x-4 text-sm text-gray-600">
                <span>
                  <strong>{parsedData.rowCount}</strong> rows
                </span>
                <span>•</span>
                <span>
                  <strong>{parsedData.columns.length}</strong> columns
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {parsedData.columns.map((column, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedData.rows.slice(0, 10).map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {parsedData.columns.map((column, colIdx) => (
                          <td
                            key={colIdx}
                            className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                          >
                            {String(row[column] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.rowCount > 10 && (
                <p className="mt-4 text-sm text-gray-500">
                  Showing first 10 of {parsedData.rowCount} rows
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4">
              <Link
                href={`/dashboard/projects/${projectId}`}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!file || !name || !parsedData || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Import Dataset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
