import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const savedLang = localStorage.getItem('ecokids-language') || 'en';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'kn', 'gu', 'pa', 'ml'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('ecokids-language', lng);
  document.documentElement.lang = lng;
});

document.documentElement.lang = i18n.language || savedLang;

export default i18n;