// src/middleware/i18nMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import middleware from 'i18next-http-middleware';
import i18next from '../config/i18n';

// Extend Express Request interface to include i18next
declare global {
  namespace Express {
    interface Request {
      t: (key: string, options?: any) => string;
      language: string;
      languages: string[];
      i18n: {
        changeLanguage: (lng: string) => Promise<any>;
        language: string;
        languages: string[];
        t: (key: string, options?: any) => string;
        exists: (key: string) => boolean;
      };
    }
  }
}

/**
 * Main i18next middleware - handles language detection and translation
 */
export const i18nMiddleware = middleware.handle(i18next, {
  // Remove language from URL path
  removeLngFromUrl: false,
  
  // Routes to ignore
  ignoreRoutes: ['/health', '/favicon.ico'],
});

/**
 * Additional middleware to add helpful methods to request object
 */
export const enhanceI18nMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Ensure req.language is available (fallback if middleware fails)
    if (!req.language) {
      req.language = req.i18n?.language || 'vi';
    }

    // Add convenience method for namespaced translations
    req.t = (key: string, options: any = {}) => {
      // Auto-detect namespace from key format
      if (key.includes('.') && !key.includes(':')) {
        const [namespace, ...keyParts] = key.split('.');
        const namespacedKey = `${namespace}:${keyParts.join('.')}`;
        return req.i18n.t(namespacedKey, options);
      }
      return req.i18n.t(key, options);
    };

    // Add language info to response headers
    res.setHeader('Content-Language', req.language);
    res.setHeader('X-Supported-Languages', 'en,vi');

    next();
  } catch (error) {
    console.error('Error in enhance i18n middleware:', error);
    // Fallback setup
    req.language = 'vi';
    req.t = (key: string) => key; // Return key as fallback
    next();
  }
};

/**
 * Validation middleware to ensure translations are working
 */
export const validateI18nMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Test if translations are working
  const testKey = req.t('common:system.health_check_ok');
  
  if (testKey === 'common:system.health_check_ok') {
    console.warn('I18n translations may not be loaded properly');
  }
  
  next();
};

/**
 * Language switching endpoint middleware
 */
export const languageSwitchMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const { lang } = req.query;
  
  if (lang && typeof lang === 'string') {
    if (['en', 'vi'].includes(lang)) {
      req.i18n.changeLanguage(lang);
      
      // Set cookie for persistence
      res.cookie('i18next', lang, {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: true,
        sameSite: 'lax'
      });
      
      req.language = lang;
    } else {
      console.warn(`Unsupported language requested: ${lang}`);
    }
  }
  
  next();
};