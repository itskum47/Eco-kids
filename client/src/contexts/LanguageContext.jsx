import React, { createContext, useState, useContext, useEffect } from 'react';
import enTranslations from '../locales/en.json';
import paTranslations from '../locales/pa.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('appLanguage') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('appLanguage', language);
        document.documentElement.lang = language;
    }, [language]);

    const t = (key) => {
        const keys = key.split('.');
        let value = language === 'pa' ? paTranslations : enTranslations;

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                // Fallback to English if Punjabi key is missing
                let fallback = enTranslations;
                for (const fk of keys) {
                    if (fallback && fallback[fk] !== undefined) fallback = fallback[fk];
                    else return key;
                }
                return fallback || key;
            }
        }
        return value;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'pa' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => useContext(LanguageContext);
