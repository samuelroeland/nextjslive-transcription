'use client'

import { LeakReport } from '../types/ReportTypes'

interface ReportExporterProps {
  report: LeakReport
  onExportPDF: () => void
  onExportJSON: () => void
  disabled?: boolean
}

const ReportExporter: React.FC<ReportExporterProps> = ({
  report,
  onExportPDF,
  onExportJSON,
  disabled = false,
}) => {
  const isEmpty = report.sections.length === 0

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Export Report</h3>
          <p className="text-sm text-gray-600">
            {report.sections.length} section
            {report.sections.length !== 1 ? 's' : ''} ready to export
          </p>
        </div>
        {!isEmpty && (
          <div className="flex gap-2">
            <button
              onClick={onExportPDF}
              disabled={disabled || isEmpty}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                disabled || isEmpty
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Export PDF
            </button>
            <button
              onClick={onExportJSON}
              disabled={disabled || isEmpty}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                disabled || isEmpty
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Export Data
            </button>
          </div>
        )}
      </div>

      {isEmpty && (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-2"
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
          <p>No sections completed yet</p>
          <p className="text-sm">
            Complete at least one section to export the report
          </p>
        </div>
      )}
    </div>
  )
}

export default ReportExporter
