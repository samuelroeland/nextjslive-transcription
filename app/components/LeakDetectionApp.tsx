'use client'

import { useEffect, useRef, useState } from 'react'
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from '../context/DeepgramContextProvider'
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from '../context/MicrophoneContextProvider'
import {
  ReportSection,
  LeakReport,
  VoiceRecordingState,
} from '../types/ReportTypes'
import LocationInput from './LocationInput'
import VoiceRecorder from './VoiceRecorder'
import ImageUploader from './ImageUploader'
import ReportSectionManager from './ReportSectionManager'
import ReportExporter from './ReportExporter'
import LanguageSelector from './LanguageSelector'

const LeakDetectionApp: React.FC = () => {
  // Voice recording state
  const [voiceState, setVoiceState] = useState<VoiceRecordingState>({
    isListening: false,
    currentTranscript: '',
    liveCaption: undefined,
  })

  // Report state
  const [currentFloor, setCurrentFloor] = useState<string>('')
  const [currentRoom, setCurrentRoom] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('nl')
  const [images, setImages] = useState<string[]>([])
  const [report, setReport] = useState<LeakReport>({
    id: `report-${Date.now()}`,
    inspectionDate: new Date(),
    sections: [],
  })

  // Deepgram and microphone hooks
  const {
    connection,
    connectToDeepgram,
    disconnectFromDeepgram,
    connectionState,
  } = useDeepgram()
  const {
    setupMicrophone,
    microphone,
    startMicrophone,
    stopMicrophone,
    microphoneState,
  } = useMicrophone()

  const captionTimeout = useRef<any>()
  const keepAliveInterval = useRef<any>()
  const lastToggleTime = useRef<number>(0)

  // Initialize microphone on load
  useEffect(() => {
    setupMicrophone()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle voice transcription
  useEffect(() => {
    if (!microphone || !connection) return

    const onData = (e: BlobEvent) => {
      if (e.data.size > 0) {
        connection?.send(e.data)
      }
    }

    const onTranscript = (data: LiveTranscriptionEvent) => {
      const { is_final: isFinal, speech_final: speechFinal } = data
      const CONFIDENCE_THRESHOLD = 0.7
      const alternative = data.channel.alternatives[0]
      let processedText = ''

      if (alternative.words && alternative.words.length > 0) {
        const highConfidenceWords = alternative.words
          .filter((word) => word.confidence >= CONFIDENCE_THRESHOLD)
          .map((word) => word.word)
          .join(' ')

        processedText = highConfidenceWords
        if (highConfidenceWords.trim() !== '') {
          // Only update live caption for interim results, don't overwrite final transcript
          if (!isFinal || !speechFinal) {
            setVoiceState((prev) => ({
              ...prev,
              liveCaption: highConfidenceWords,
            }))
          }
        }
      } else {
        processedText = alternative.transcript
        if (processedText !== '') {
          // Only update live caption for interim results, don't overwrite final transcript
          if (!isFinal || !speechFinal) {
            setVoiceState((prev) => ({ ...prev, liveCaption: processedText }))
          }
        }
      }

      // Add to current transcript ONLY when final and speech is final
      if (isFinal && speechFinal && processedText.trim() !== '') {
        console.log('Adding final transcript:', processedText.trim())
        setVoiceState((prev) => {
          const newTranscript =
            prev.currentTranscript +
            (prev.currentTranscript ? ' ' : '') +
            processedText.trim()
          console.log('New full transcript:', newTranscript)
          return {
            ...prev,
            currentTranscript: newTranscript,
            liveCaption: undefined, // Clear live caption when adding to final transcript
          }
        })

        clearTimeout(captionTimeout.current)
        captionTimeout.current = setTimeout(() => {
          setVoiceState((prev) => ({ ...prev, liveCaption: undefined }))
        }, 1000) // Reduced timeout since we clear immediately above
      }
    }

    if (
      connectionState === LiveConnectionState.OPEN &&
      voiceState.isListening
    ) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript)
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData)
      startMicrophone()
    }

    return () => {
      connection.removeListener(
        LiveTranscriptionEvents.Transcript,
        onTranscript,
      )
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData)
      clearTimeout(captionTimeout.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState, voiceState.isListening])

  // Keep alive interval
  useEffect(() => {
    if (!connection) return

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive()
      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive()
      }, 10000)
    } else {
      clearInterval(keepAliveInterval.current)
    }

    return () => {
      clearInterval(keepAliveInterval.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState, connectionState])

  // Voice recording toggle
  const toggleListening = async () => {
    console.log('Toggle listening called, current state:', {
      isListening: voiceState.isListening,
      microphoneState,
      connectionState,
      timestamp: new Date().toISOString(),
    })

    // Prevent rapid toggling
    const now = Date.now()

    if (now - lastToggleTime.current < 1000) {
      // Prevent toggling within 1 second
      console.log('Preventing rapid toggle, too soon since last toggle')
      return
    }
    lastToggleTime.current = now

    if (voiceState.isListening) {
      // Stop listening
      console.log('Stopping recording...')
      setVoiceState((prev) => ({
        ...prev,
        isListening: false,
        liveCaption: undefined,
      }))

      // Add small delay to ensure state is updated
      setTimeout(() => {
        stopMicrophone()
        disconnectFromDeepgram()
      }, 100)
    } else {
      // Start listening - allow if microphone is Ready OR Paused
      if (
        microphoneState === MicrophoneState.Ready ||
        microphoneState === MicrophoneState.Paused
      ) {
        console.log(
          'Starting recording with microphone state:',
          microphoneState,
        )
        setVoiceState((prev) => ({ ...prev, isListening: true }))

        try {
          await connectToDeepgram({
            model: 'nova-3',
            language: selectedLanguage,
            interim_results: true,
            smart_format: true,
            filler_words: true,
            utterance_end_ms: 3000,
            include_confidence: true,
          })
          console.log('Successfully connected to Deepgram')
        } catch (error) {
          console.error('Failed to connect to Deepgram:', error)
          setVoiceState((prev) => ({ ...prev, isListening: false }))
        }
      } else {
        console.log(
          'Cannot start recording, microphone state:',
          microphoneState,
        )
      }
    }
  }

  // Add images to current section
  const handleImagesAdd = (newImages: string[]) => {
    setImages((prev) => [...prev, ...newImages])
  }

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Save current section to report
  const saveSection = () => {
    if (!currentFloor || !currentRoom) return

    const newSection: ReportSection = {
      id: `section-${Date.now()}`,
      floor: currentFloor,
      room: currentRoom,
      description: voiceState.currentTranscript,
      images: [...images],
      timestamp: new Date(),
    }

    setReport((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))

    // Clear current section
    startNewSection()
  }

  // Start new section
  const startNewSection = () => {
    console.log('Starting new section...')

    // Stop listening if active
    if (voiceState.isListening) {
      console.log('Stopping current recording for new section')
      setVoiceState((prev) => ({ ...prev, isListening: false }))
      stopMicrophone()
      disconnectFromDeepgram()
    }

    // Clear current section data
    setCurrentFloor('')
    setCurrentRoom('')
    setImages([])
    setVoiceState((prev) => ({
      ...prev,
      currentTranscript: '',
      liveCaption: undefined,
      isListening: false, // Ensure listening state is false
    }))

    console.log(
      'New section started, microphone state should be ready for next use',
    )
  }

  // Export functions
  const exportPDF = () => {
    // TODO: Implement PDF export
    console.log('Export PDF', report)
    alert('PDF export functionality coming soon!')
  }

  const exportJSON = () => {
    const dataStr = JSON.stringify(report, null, 2)
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `leak-report-${
      new Date().toISOString().split('T')[0]
    }.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const canSave = !!(
    currentFloor &&
    currentRoom &&
    (voiceState.currentTranscript || images.length > 0)
  )
  const hasContent = !!(voiceState.currentTranscript || images.length > 0)

  return (
    <div className=" bg-gray-100 p-4 ">
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Leak Detection Report
          </h1>
          <p className="text-gray-600">
            Document leak findings room by room with voice notes and photos
          </p>
        </div>

        {/* Current Section */}
        <div className="space-y-4">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            disabled={voiceState.isListening}
          />

          <LocationInput
            floor={currentFloor}
            room={currentRoom}
            onFloorChange={setCurrentFloor}
            onRoomChange={setCurrentRoom}
            disabled={voiceState.isListening}
          />

          <VoiceRecorder
            isListening={voiceState.isListening}
            liveCaption={voiceState.liveCaption}
            currentTranscript={voiceState.currentTranscript}
            onToggleListening={toggleListening}
            microphoneReady={
              microphoneState === MicrophoneState.Ready ||
              microphoneState === MicrophoneState.Paused ||
              voiceState.isListening
            }
          />

          <ImageUploader
            images={images}
            onImagesAdd={handleImagesAdd}
            onImageRemove={handleImageRemove}
          />
        </div>

        {/* Section Management */}
        <ReportSectionManager
          sections={report.sections}
          onSaveSection={saveSection}
          onStartNewSection={startNewSection}
          canSave={!!canSave}
          currentFloor={currentFloor}
          currentRoom={currentRoom}
          hasContent={hasContent}
        />

        {/* Export */}
        <ReportExporter
          report={report}
          onExportPDF={exportPDF}
          onExportJSON={exportJSON}
        />
      </div>
    </div>
  )
}

export default LeakDetectionApp
