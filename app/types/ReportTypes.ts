// Types for the leak detection report system

export interface ReportSection {
  id: string
  floor: string
  room: string
  description: string
  images: string[]
  timestamp: Date
}

export interface LeakReport {
  id: string
  propertyAddress?: string
  inspectorName?: string
  inspectionDate: Date
  sections: ReportSection[]
}

export interface VoiceRecordingState {
  isListening: boolean
  currentTranscript: string
  liveCaption?: string
}
