'use client'
import { useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Language {
  code: string
  name: string
  flag: string
  comingSoon?: boolean
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸', comingSoon: true },
  { code: 'fr', name: 'Français', flag: '🇫🇷', comingSoon: true },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', comingSoon: true },
  { code: 'zh', name: '中文', flag: '🇨🇳', comingSoon: true },
  { code: 'ja', name: '日本語', flag: '🇯🇵', comingSoon: true },
  { code: 'ko', name: '한국어', flag: '🇰🇷', comingSoon: true },
  { code: 'pt', name: 'Português', flag: '🇧🇷', comingSoon: true },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', comingSoon: true },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', comingSoon: true },
]

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])

  const handleLanguageSelect = (language: Language) => {
    if (language.comingSoon) {
      // Show coming soon message
      alert(`${language.name} support is coming soon! We're working hard to bring Lenno to more languages.`)
      return
    }
    
    setSelectedLanguage(language)
    setIsOpen(false)
    // Here you would implement actual language switching logic
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors w-full"
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium">{selectedLanguage.flag} {selectedLanguage.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Language Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-primary-200 z-50 max-h-80 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-primary-200">
                <h3 className="font-semibold text-primary-900">Select Language</h3>
                <p className="text-xs text-primary-600 mt-1">
                  More languages coming soon!
                </p>
              </div>

              {/* Languages List */}
              <div className="max-h-64 overflow-y-auto">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language)}
                    className={`w-full flex items-center justify-between p-3 hover:bg-primary-50 transition-colors text-left ${
                      selectedLanguage.code === language.code ? 'bg-secondary-50 text-secondary-700' : 'text-primary-700'
                    } ${language.comingSoon ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{language.flag}</span>
                      <span className="text-sm font-medium">{language.name}</span>
                    </div>
                    {language.comingSoon && (
                      <span className="text-xs bg-accent-100 text-accent-700 px-2 py-1 rounded-full">
                        Soon
                      </span>
                    )}
                    {selectedLanguage.code === language.code && !language.comingSoon && (
                      <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-primary-200 bg-primary-50">
                <p className="text-xs text-primary-600 text-center">
                  Help us translate Lenno to your language!{' '}
                  <button 
                    className="text-secondary-600 hover:text-secondary-700 font-medium"
                    onClick={() => window.open('mailto:translate@lenno.app', '_blank')}
                  >
                    Get involved
                  </button>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}