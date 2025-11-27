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
        <div className="flex items-center space-x-2 text-sm text-blue-600 mb-3">
          <Link href="/dashboard" className="hover:text-blue-800 transition font-medium">
            Projects
          </Link>
          <span className="text-blue-400">/</span>
          <span className="text-blue-900 font-semibold">{project.name}</span>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-blue-700/70">{project.description}</p>
            )}
            <p className="mt-1 text-sm text-blue-600/60">
              Created {formatDate(project.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Step 1: Templates */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg border-2 border-blue-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            <span className="text-3xl font-bold text-blue-900">
              {project.templates.length}
            </span>
          </div>
          <h3 className="text-lg font-bold text-blue-900 mb-2">Templates</h3>
          <p className="text-sm text-blue-700/70 mb-4">
            Upload and design your badge templates
          </p>
          <Link
            href={`/dashboard/projects/${project.id}/templates/new`}
            className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 rounded-xl font-semibold transition-all text-sm shadow-lg shadow-blue-500/30 hover:scale-105"
          >
            + Upload Template
          </Link>
        </div>

        {/* Step 2: Datasets */}
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-lg border-2 border-emerald-100 p-6 hover:shadow-xl hover:border-emerald-200 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <span className="text-3xl font-bold text-emerald-900">
              {project.datasets.length}
            </span>
          </div>
          <h3 className="text-lg font-bold text-emerald-900 mb-2">Datasets</h3>
          <p className="text-sm text-emerald-700/70 mb-4">
            Import CSV or Excel data files
          </p>
          <Link
            href={`/dashboard/projects/${project.id}/datasets/new`}
            className="block w-full text-center bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-2.5 px-4 rounded-xl font-semibold transition-all text-sm shadow-lg shadow-emerald-500/30 hover:scale-105"
          >
            + Import Data
          </Link>
        </div>

        {/* Step 3: Generate */}
        <div className="bg-gradient-to-br from-violet-50 to-white rounded-2xl shadow-lg border-2 border-violet-100 p-6 hover:shadow-xl hover:border-violet-200 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">3</span>
            </div>
            <span className="text-3xl font-bold text-violet-900">
              {project.exports.length}
            </span>
          </div>
          <h3 className="text-lg font-bold text-violet-900 mb-2">Generate</h3>
          <p className="text-sm text-violet-700/70 mb-4">
            Map fields and generate badges
          </p>
          {project.templates.length > 0 && project.datasets.length > 0 ? (
            <Link
              href={`/dashboard/projects/${project.id}/mappings/new`}
              className="block w-full text-center bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white py-2.5 px-4 rounded-xl font-semibold transition-all text-sm shadow-lg shadow-violet-500/30 hover:scale-105"
            >
              Create Mapping
            </Link>
          ) : (
            <button
              disabled
              className="block w-full text-center bg-gray-300 text-gray-500 py-2.5 px-4 rounded-xl font-semibold cursor-not-allowed text-sm"
            >
              Complete Steps 1 & 2
            </button>
          )}
        </div>
      </div>

      {/* Templates Section */}
      {project.templates.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-blue-900">Templates</h2>
            <Link
              href={`/dashboard/projects/${project.id}/templates/new`}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
            >
              <span>+</span> Add Template
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.templates.map((template) => (
              <div
                key={template.id}
                className="border-2 border-blue-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all group bg-white"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-blue-100/50 relative">
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-full object-contain p-4"
                  />
                </div>
                <div className="p-4 bg-gradient-to-br from-white to-blue-50/30">
                  <h3 className="font-bold text-blue-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-blue-600/70 mb-3">
                    {template.imageWidth} × {template.imageHeight}px
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/projects/${project.id}/templates/${template.id}`}
                      className="flex-1 text-center text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-emerald-900">Datasets</h2>
            <Link
              href={`/dashboard/projects/${project.id}/datasets/new`}
              className="text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-2 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              + Import Data
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.datasets.map((dataset) => {
              const columns = JSON.parse(dataset.columns || '[]') as string[];
              return (
                <div
                  key={dataset.id}
                  className="border-2 border-emerald-100 rounded-2xl p-5 hover:shadow-xl hover:border-emerald-200 transition-all bg-gradient-to-br from-white to-emerald-50/30"
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-emerald-900 mb-2">
                      {dataset.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-emerald-700">
                      <span className="px-2 py-1 bg-emerald-100 rounded-lg font-semibold">{dataset.rowCount} rows</span>
                      <span className="px-2 py-1 bg-emerald-100 rounded-lg font-semibold">{columns.length} columns</span>
                    </div>
                    <p className="text-xs text-emerald-600/60 mt-2">
                      {formatDate(dataset.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center">
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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-violet-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-violet-900">
            Field Mappings
          </h2>
          {project.templates.length > 0 && project.datasets.length > 0 && (
            <Link
              href={`/dashboard/projects/${project.id}/mappings/new`}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              Create Mapping
            </Link>
          )}
        </div>

        {fieldMappings.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-violet-50 to-white rounded-xl border-2 border-dashed border-violet-200">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-violet-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔗</span>
            </div>
            <p className="text-violet-800 font-semibold mb-2">
              {project.templates.length === 0 || project.datasets.length === 0
                ? 'Complete the first steps'
                : 'No field mappings yet'}
            </p>
            <p className="text-violet-600/70 mb-6 text-sm max-w-md mx-auto">
              {project.templates.length === 0 || project.datasets.length === 0
                ? 'Create a template and upload a dataset to create field mappings.'
                : 'Create a mapping to connect template fields with dataset columns.'}
            </p>
            {project.templates.length > 0 && project.datasets.length > 0 && (
              <Link
                href={`/dashboard/projects/${project.id}/mappings/new`}
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
              >
                Create Your First Mapping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {fieldMappings.map((mapping) => {
              const mappingsData = JSON.parse(mapping.mappings) as Record<string, string>;
              const fieldCount = Object.keys(mappingsData).length;

              return (
                <div
                  key={mapping.id}
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-violet-50 to-white rounded-xl border-2 border-violet-100 hover:border-violet-200 hover:shadow-lg transition-all"
                >
                  <div>
                    <p className="font-bold text-violet-900 mb-1">
                      {mapping.template.name} → {mapping.dataset.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-lg font-semibold">{fieldCount} fields</span>
                      <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-lg font-semibold">{mapping.dataset.rowCount} rows</span>
                    </div>
                    <p className="text-xs text-violet-600/60 mt-2">
                      {formatDate(mapping.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/projects/${project.id}/mappings/${mapping.id}`}
                      className="text-sm text-violet-600 hover:text-violet-700 font-semibold py-2 px-4 hover:bg-violet-50 rounded-lg transition"
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-6 mt-8">
          <h2 className="text-xl font-bold text-blue-900 mb-6">
            Recent Exports
          </h2>
          <div className="space-y-4">
            {project.exports.map((exportItem) => (
              <div
                key={exportItem.id}
                className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-white rounded-xl border-2 border-blue-100 hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div>
                  <p className="font-bold text-blue-900 mb-1">
                    {exportItem.badgeCount} badges generated
                  </p>
                  <p className="text-sm text-blue-600/70">
                    {formatDate(exportItem.startedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      exportItem.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : exportItem.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {exportItem.status}
                  </span>
                  <Link
                    href={`/dashboard/projects/${project.id}/exports/${exportItem.id}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm px-4 py-2 hover:bg-blue-50 rounded-lg transition"
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
