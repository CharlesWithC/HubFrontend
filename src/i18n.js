import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import de from './languages/de.json';
import en from './languages/en.json';
import es from './languages/es.json';
import nl from './languages/nl.json';
import pt from './languages/pt.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            de: { translation: de },
            en: { translation: en },
            es: { translation: es },
            nl: { translation: nl },
            pt: { translation: pt },
        },
        fallbackLng: "en",
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
            caches: ['cookie'],
            lookupFromPathIndex: 0,
            checkWhitelist: true,
            checkForSimilarInWhitelist: true,
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;