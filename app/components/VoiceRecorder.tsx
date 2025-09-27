'use client'

import { useRef } from 'react'

interface VoiceRecorderProps {
  isListening: boolean
  liveCaption?: string
  currentTranscript: string
  onToggleListening: () => void
  microphoneReady: boolean
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isListening,
  liveCaption,
  currentTranscript,
  onToggleListening,
  microphoneReady,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleRecordingToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent multiple rapid clicks/touches
    if (buttonRef.current) {
      buttonRef.current.disabled = true
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.disabled = !microphoneReady
        }
      }, 500) // Re-enable after 500ms to prevent rapid clicking
    }

    console.log('Button clicked/touched, isListening:', isListening)
    onToggleListening()
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-md mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Issue Description
        </h3>
        <button
          ref={buttonRef}
          onTouchStart={(e) => e.preventDefault()}
          onClick={handleRecordingToggle}
          disabled={!microphoneReady}
          style={{ touchAction: 'manipulation' }} // Prevent zoom on double-tap
          className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-sm shadow-lg transition-all duration-200 select-none ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600'
          } ${
            !microphoneReady
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:scale-110 active:scale-95'
          }`}
        >
          {isListening ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <rect x="6" y="4" width="8" height="12" rx="1" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Live Caption */}
      {liveCaption && (
        <div className="bg-blue-50 p-3 rounded-md mb-3">
          <p className="text-sm text-blue-800 italic">{liveCaption}</p>
        </div>
      )}

      {/* Current Transcript */}
      <div className="min-h-[120px] p-3 border border-gray-200 rounded-md bg-gray-50">
        {currentTranscript ? (
          <p className="text-gray-700 leading-relaxed">{currentTranscript}</p>
        ) : (
          <p className="text-gray-400 italic">
            {isListening
              ? 'Listening... Start speaking to describe the issue.'
              : 'Click the microphone to start dictating the issue description.'}
          </p>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {isListening
          ? 'Recording... Click the red button to stop'
          : 'Click the blue microphone to start recording'}
      </p>
    </div>
  )
}

export default VoiceRecorder
