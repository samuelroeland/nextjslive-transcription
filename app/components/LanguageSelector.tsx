'use client'

import { useState } from 'react'

interface LanguageSelectorProps {
  selectedLanguage: string
  onLanguageChange: (language: string) => void
  disabled?: boolean
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  disabled = false
}) => {
  const languages = [
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]

  return (
    <div className="bg-white rounded-lg p-4 shadow-md mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Select Language / Selecteer Taal / Sélectionner la Langue
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            disabled={disabled}
            className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ${
              selectedLanguage === language.code
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            } ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            <span className="text-2xl mr-2">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
          </button>
        ))}
      </div>
      {selectedLanguage && (
        <p className="text-sm text-gray-600 mt-2">
          {selectedLanguage === 'nl' && 'Geselecteerde taal: Nederlands'}
          {selectedLanguage === 'en' && 'Selected language: English'}
          {selectedLanguage === 'fr' && 'Langue sélectionnée: Français'}
        </p>
      )}
    </div>
  )
}

export default LanguageSelector