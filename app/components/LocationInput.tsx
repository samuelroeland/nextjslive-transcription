'use client'

import { useState } from 'react'

interface LocationInputProps {
  floor: string
  room: string
  onFloorChange: (floor: string) => void
  onRoomChange: (room: string) => void
  disabled?: boolean
}

const LocationInput: React.FC<LocationInputProps> = ({
  floor,
  room,
  onFloorChange,
  onRoomChange,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Current Location
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="floor"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Floor
          </label>
          <input
            id="floor"
            type="text"
            value={floor}
            onChange={(e) => onFloorChange(e.target.value)}
            placeholder="e.g., Ground Floor, 1st Floor, Basement"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label
            htmlFor="room"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Room
          </label>
          <input
            id="room"
            type="text"
            value={room}
            onChange={(e) => onRoomChange(e.target.value)}
            placeholder="e.g., Kitchen, Bathroom, Living Room"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>
    </div>
  )
}

export default LocationInput
