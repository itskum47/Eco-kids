import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * LanguageWrapper - Ensures translations are loaded before rendering children
 * This prevents blank pages when switching languages
 */
const LanguageWrapper = ({ children }) => {
  const { i18n, ready } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if i18n is initialized and ready
    const checkReady = () => {
      if (i18n.isInitialized && ready) {
        setIsReady(true);
      }
    };

    checkReady();

    // Listen for language changes
    const handleLanguageChanged = () => {
      // Small delay to ensure translations are loaded
      setTimeout(() => {
        setIsReady(true);
      }, 50);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    i18n.on('initialized', checkReady);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
      i18n.off('initialized', checkReady);
    };
  }, [i18n, ready]);

  // Show loading state while translations are loading
  if (!isReady) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'var(--font-body), sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255,255,255,0.3)',
            borderTop: '5px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ fontSize: '18px', margin: 0 }}>Loading translations...</p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LanguageWrapper;