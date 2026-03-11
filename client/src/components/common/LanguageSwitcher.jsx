import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { code: 'en', flag: '🌐', name: 'English' },
  { code: 'hi', flag: '🇮🇳', name: 'हिंदी' },
  { code: 'bn', flag: '🇮🇳', name: 'বাংলা' },
  { code: 'ta', flag: '🇮🇳', name: 'தமிழ்' },
  { code: 'te', flag: '🇮🇳', name: 'తెలుగు' },
  { code: 'mr', flag: '🇮🇳', name: 'मराठी' },
  { code: 'kn', flag: '🇮🇳', name: 'ಕನ್ನಡ' },
  { code: 'gu', flag: '🇮🇳', name: 'ગુજરાતી' },
  { code: 'pa', flag: '🇮🇳', name: 'ਪੰਜਾਬੀ' },
  { code: 'ml', flag: '🇮🇳', name: 'മലയാളം' }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangCode = i18n.language || 'en';
  const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative ml-2" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 sm:space-x-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-full border-2 border-green-200 bg-white hover:bg-green-50 transition-colors shadow-sm font-bold text-gray-700 max-w-[120px] sm:max-w-none"
        aria-label="Select Language"
      >
        <span className="text-base sm:text-lg leading-none">{currentLang.flag}</span>
        <span className="text-xs sm:text-sm truncate uppercase tracking-wider">{currentLang.code}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-[60vh] overflow-y-auto"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors flex items-center space-x-3 text-sm
                  ${currentLangCode === lang.code ? 'bg-green-100 font-bold text-green-800' : 'text-gray-700 font-medium'}`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}