import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Simple minimal translations for testing
const resources = {
  en: {
    translation: {
      "navigation": {
        "home": "Home",
        "topics": "Topics", 
        "games": "Games",
        "experiments": "Experiments"
      },
      "home": {
        "hero": {
          "title": "Welcome to EcoKids India",
          "subtitle": "Learning for a sustainable future"
        }
      }
    }
  },
  hi: {
    translation: {
      "navigation": {
        "home": "होम",
        "topics": "विषय",
        "games": "खेल", 
        "experiments": "प्रयोग"
      },
      "home": {
        "hero": {
          "title": "ईकोकिड्स इंडिया में आपका स्वागत है",
          "subtitle": "एक स्थायी भविष्य के लिए सीखना"
        }
      }
    }
  }
};


i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    }
  })
  .catch((error) => {
    console.error('❌ Minimal i18n initialization failed:', error);
  });

export default i18n;