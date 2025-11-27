'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  imageUrl: string;
  fields: string;
}

interface Dataset {
  id: string;
  name: string;
  rowCount: number;
  columns: string;
  data: string;
}

interface TemplateField {
  id: string;
  text: string;
}

interface FieldMapping {
  [fieldId: string]: string; // fieldId -> columnName
}

interface PreviewRow {
  [fieldId: string]: string | number;
}

export default function NewMappingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedDatasetId, setSelectedDatasetId] = useState('');
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [datasetColumns, setDatasetColumns] = useState<string[]>([]);
  const [mappings, setMappings] = useState<FieldMapping>({});
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load templates and datasets
  useEffect(() => {
    const loadData = async () => {
      try {
        const [templatesRes, datasetsRes] = await Promise.all([
          fetch(`/api/templates?projectId=${projectId}`),
          fetch(`/api/datasets?projectId=${projectId}`),
        ]);

        const templatesData = await templatesRes.json();
        const datasetsData = await datasetsRes.json();

        if (templatesData.success) {
          setTemplates(templatesData.data);
        }
        if (datasetsData.success) {
          setDatasets(datasetsData.data);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load templates and datasets');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  // Load template fields when template selected
  useEffect(() => {
    if (!selectedTemplateId) {
      setTemplateFields([]);
      setMappings({});
      return;
    }

    const template = templates.find((t) => t.id === selectedTemplateId);
    if (template) {
      const fields = JSON.parse(template.fields || '[]') as TemplateField[];
      setTemplateFields(fields);
      
      // Initialize empty mappings
      const initialMappings: FieldMapping = {};
      fields.forEach((field) => {
        initialMappings[field.id] = '';
      });
      setMappings(initialMappings);
    }
  }, [selectedTemplateId, templates]);

  // Load dataset columns and preview when dataset selected
  useEffect(() => {
    if (!selectedDatasetId) {
      setDatasetColumns([]);
      setPreviewRows([]);
      return;
    }

    const dataset = datasets.find((d) => d.id === selectedDatasetId);
    if (dataset) {
      const columns = JSON.parse(dataset.columns || '[]') as string[];
      const data = JSON.parse(dataset.data || '[]') as Record<string, string | number>[];
      
      setDatasetColumns(columns);
      setPreviewRows(data.slice(0, 3)); // First 3 rows for preview
    }
  }, [selectedDatasetId, datasets]);

  const handleMappingChange = (fieldId: string, columnName: string) => {
    setMappings({
      ...mappings,
      [fieldId]: columnName,
    });
  };

  const validateMappings = (): boolean => {
    // Check all fields are mapped
    for (const fieldId in mappings) {
      if (!mappings[fieldId]) {
        setError('Please map all template fields to dataset columns');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedTemplateId || !selectedDatasetId) {
      setError('Please select both a template and a dataset');
      return;
    }

    if (!validateMappings()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/field-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: projectId,
          templateId: selectedTemplateId,
          datasetId: selectedDatasetId,
          mappings: JSON.stringify(mappings),
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/dashboard/projects/${projectId}`);
      } else {
        setError(data.error?.userMessage || 'Failed to save field mapping');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save field mapping. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getMappedPreview = (fieldId: string, row: PreviewRow): string => {
    const columnName = mappings[fieldId];
    if (!columnName) return '—';
    
    const value = row[columnName];
    return value !== undefined && value !== null ? String(value) : '—';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to project
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Field Mapping</h1>
          <p className="mt-2 text-gray-600">
            Map template fields to dataset columns to generate badges
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template and Dataset Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Template Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a template...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {templates.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No templates available. Create a template first.
                </p>
              )}
            </div>

            {/* Dataset Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Dataset
              </label>
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a dataset...</option>
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.rowCount} rows)
                  </option>
                ))}
              </select>
              {datasets.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No datasets available. Import data first.
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Field Mappings */}
          {templateFields.length > 0 && datasetColumns.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Field Mappings
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Map each template field to a column from your dataset
              </p>

              <div className="space-y-4">
                {templateFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.text}
                      </label>
                      <p className="text-xs text-gray-500">Template Field</p>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <select
                        value={mappings[field.id] || ''}
                        onChange={(e) =>
                          handleMappingChange(field.id, e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select column...</option>
                        {datasetColumns.map((column) => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Dataset Column</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {templateFields.length > 0 &&
            previewRows.length > 0 &&
            Object.values(mappings).some((v) => v) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Preview
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Preview of how your fields will be populated (first 3 rows)
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Row
                        </th>
                        {templateFields.map((field) => (
                          <th
                            key={field.id}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                          >
                            {field.text}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {idx + 1}
                          </td>
                          {templateFields.map((field) => (
                            <td
                              key={field.id}
                              className="px-4 py-3 text-sm text-gray-900"
                            >
                              {getMappedPreview(field.id, row)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
              disabled={
                !selectedTemplateId ||
                !selectedDatasetId ||
                templateFields.length === 0 ||
                saving
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Mapping'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
