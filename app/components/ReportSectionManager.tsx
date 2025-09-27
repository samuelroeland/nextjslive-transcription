'use client'

import { ReportSection } from '../types/ReportTypes'

interface ReportSectionProps {
  sections: ReportSection[]
  onSaveSection: () => void
  onStartNewSection: () => void
  canSave: boolean
  currentFloor: string
  currentRoom: string
  hasContent: boolean
}

const ReportSectionManager: React.FC<ReportSectionProps> = ({
  sections,
  onSaveSection,
  onStartNewSection,
  canSave,
  currentFloor,
  currentRoom,
  hasContent,
}) => {
  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex gap-3">
          <button
            onClick={onSaveSection}
            disabled={!canSave}
            className={`px-6 py-2 rounded font-medium transition-colors ${
              canSave
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Complete Section
          </button>
          <button
            onClick={onStartNewSection}
            disabled={!hasContent}
            className={`px-6 py-2 rounded font-medium transition-colors ${
              hasContent
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            New Room/Section
          </button>
        </div>
        {canSave && (
          <p className="text-sm text-gray-600 mt-2">
            Complete this section for: {currentFloor} - {currentRoom}
          </p>
        )}
      </div>

      {/* Completed Sections List */}
      {sections.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Completed Sections ({sections.length})
          </h3>
          <div className="space-y-3">
            {sections.map((section) => (
              <div
                key={section.id}
                className="border border-gray-200 rounded p-3 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {section.floor} - {section.room}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {section.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {section.images.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {section.images.length} photo
                        {section.images.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {section.description || 'No description recorded'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportSectionManager
