import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' }
];

const LanguageSwitcher = ({ variant = 'dropdown' }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    if (variant === 'compact') {
        return (
            <div ref={dropdownRef} className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium
                     bg-[var(--s1)]/5 border border-white/10 text-white/70
                     hover:bg-[var(--s1)]/10 hover:text-white transition-all duration-200"
                    aria-label="Change language"
                >
                    <Globe className="w-4 h-4" />
                    <span className="uppercase text-xs tracking-wider">{currentLang.code}</span>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-52 py-1.5 rounded-xl z-50
                          bg-gray-900/95 backdrop-blur-xl border border-white/10
                          shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                  ${lang.code === currentLang.code
                                        ? 'text-emerald-400 bg-emerald-500/10'
                                        : 'text-white/70 hover:text-white hover:bg-[var(--s1)]/5'
                                    }`}
                            >
                                <span className="text-base">{lang.flag}</span>
                                <span className="flex-1 text-left">{lang.nativeName}</span>
                                {lang.code === currentLang.code && (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Default: full dropdown
    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                   bg-[var(--s1)]/5 border border-white/10 text-white/80
                   hover:bg-[var(--s1)]/10 hover:text-white hover:border-white/20
                   transition-all duration-200"
                aria-label="Change language"
            >
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>{currentLang.flag}</span>
                <span>{currentLang.nativeName}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-60 py-2 rounded-xl z-50
                        bg-gray-900/95 backdrop-blur-xl border border-white/10
                        shadow-2xl shadow-black/50">
                    <div className="px-4 py-2 border-b border-white/5">
                        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">
                            Select Language
                        </p>
                    </div>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                ${lang.code === currentLang.code
                                    ? 'text-emerald-400 bg-emerald-500/10'
                                    : 'text-white/70 hover:text-white hover:bg-[var(--s1)]/5'
                                }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <div className="flex-1 text-left">
                                <div className="font-medium">{lang.nativeName}</div>
                                <div className="text-xs text-white/40">{lang.name}</div>
                            </div>
                            {lang.code === currentLang.code && (
                                <Check className="w-4 h-4 text-emerald-400" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
