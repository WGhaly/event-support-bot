'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { DeleteButton } from '@/components/delete-button';

interface Template {
  id: string;
  name: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
}

interface Dataset {
  id: string;
  name: string;
  columns: string;
  rowCount: number;
  createdAt: Date;
}

interface FieldMapping {
  id: string;
  mappings: string;
  createdAt: Date;
  template: { id: string; name: string };
  dataset: { id: string; name: string; rowCount: number };
}

interface ProjectContentProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    templates: Template[];
    datasets: Dataset[];
    exports: any[];
  };
  fieldMappings: FieldMapping[];
}

export function ProjectContent({ project, fieldMappings }: ProjectContentProps) {
  const router = useRouter();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
          <Link href="/dashboard" className="hover:text-gray-900 transition">
            Projects
          </Link>
          <span>/</span>
          <span className="text-gray-900">{project.name}</span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-gray-600">{project.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Created {formatDate(project.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Step 1: Templates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {project.templates.length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Templates</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload and design your badge templates
          </p>
          <Link
            href={`/dashboard/projects/${project.id}/templates/new`}
            className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
          >
            + Upload Template
          </Link>
        </div>

        {/* Step 2: Datasets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {project.datasets.length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Datasets</h3>
          <p className="text-sm text-gray-600 mb-4">
            Import CSV or Excel data files
          </p>
          <Link
            href={`/dashboard/projects/${project.id}/datasets/new`}
            className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
          >
            + Import Data
          </Link>
        </div>

        {/* Step 3: Generate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">3</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {project.exports.length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate</h3>
          <p className="text-sm text-gray-600 mb-4">
            Map fields and generate badges
          </p>
          {project.templates.length > 0 && project.datasets.length > 0 ? (
            <Link
              href={`/dashboard/projects/${project.id}/mappings/new`}
              className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
            >
              Create Mapping
            </Link>
          ) : (
            <button
              disabled
              className="block w-full text-center bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-semibold cursor-not-allowed text-sm"
            >
              Complete Steps 1 & 2
            </button>
          )}
        </div>
      </div>

      {/* Templates Section */}
      {project.templates.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Templates</h2>
            <Link
              href={`/dashboard/projects/${project.id}/templates/new`}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              + Add Template
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition group"
              >
                <div className="aspect-[3/4] bg-gray-100 relative">
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {template.imageWidth} × {template.imageHeight}px
                  </p>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/projects/${project.id}/templates/${template.id}`}
                      className="flex-1 text-center text-sm bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      itemType="template"
                      itemId={template.id}
                      onDelete={() => router.refresh()}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Datasets Section */}
      {project.datasets.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Datasets</h2>
            <Link
              href={`/dashboard/projects/${project.id}/datasets/new`}
              className="text-sm bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              + Import Data
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.datasets.map((dataset) => {
              const columns = JSON.parse(dataset.columns || '[]') as string[];
              return (
                <div
                  key={dataset.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {dataset.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {dataset.rowCount} rows • {columns.length} columns
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(dataset.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DeleteButton
                      itemType="dataset"
                      itemId={dataset.id}
                      onDelete={() => router.refresh()}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Field Mappings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Field Mappings
          </h2>
          {project.templates.length > 0 && project.datasets.length > 0 && (
            <Link
              href={`/dashboard/projects/${project.id}/mappings/new`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Create Mapping
            </Link>
          )}
        </div>

        {fieldMappings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {project.templates.length === 0 || project.datasets.length === 0
                ? 'Create a template and upload a dataset to create field mappings.'
                : 'No field mappings yet. Create one to map template fields to dataset columns.'}
            </p>
            {project.templates.length > 0 && project.datasets.length > 0 && (
              <Link
                href={`/dashboard/projects/${project.id}/mappings/new`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Create Mapping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {fieldMappings.map((mapping) => {
              const mappingsData = JSON.parse(mapping.mappings) as Record<string, string>;
              const fieldCount = Object.keys(mappingsData).length;

              return (
                <div
                  key={mapping.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {mapping.template.name} → {mapping.dataset.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {fieldCount} fields mapped • {mapping.dataset.rowCount} rows
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(mapping.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/projects/${project.id}/mappings/${mapping.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 py-2 px-3"
                    >
                      View
                    </Link>
                    <DeleteButton
                      itemType="field-mapping"
                      itemId={mapping.id}
                      onDelete={() => router.refresh()}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {project.exports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Exports
          </h2>
          <div className="space-y-3">
            {project.exports.map((exportItem) => (
              <div
                key={exportItem.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {exportItem.badgeCount} badges
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(exportItem.startedAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      exportItem.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : exportItem.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {exportItem.status}
                  </span>
                  <Link
                    href={`/dashboard/projects/${project.id}/exports/${exportItem.id}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
