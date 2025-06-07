// src/config/i18n.ts
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import path from 'path';

// Initialize i18next
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    // Language settings
    lng: 'vi', // Default language
    fallbackLng: 'en', // Fallback language
    supportedLngs: ['en', 'vi'],
    
    // Detection settings
    detection: {
      // Order of language detection
      order: ['querystring', 'header', 'cookie'],
      // Query parameter name
      lookupQuerystring: 'lang',
      // Header name
      lookupHeader: 'accept-language',
      // Cookie name
      lookupCookie: 'i18next',
      // Cache language in cookie
      caches: ['cookie'],
    },

    // Backend settings
    backend: {
      // Path to translation files
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
      // Path for adding missing keys
      addPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.missing.json'),
    },

    // Interpolation settings
    interpolation: {
      escapeValue: false, // React/Node.js already escapes values
      format: (value, format) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        return value;
      }
    },

    // Namespace settings
    ns: ['common', 'errors', 'success', 'validation'],
    defaultNS: 'common',

    // Development settings
    debug: process.env.NODE_ENV === 'development',
    saveMissing: process.env.NODE_ENV === 'development',

    // Additional options
    returnEmptyString: false,
    returnNull: false,
    returnObjects: false,
  });

export default i18next;