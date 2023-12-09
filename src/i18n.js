import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const en = require("./languages/en.js").en;
const es = require("./languages/es.js").es;
const nl = require("./languages/nl.js").nl;

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            es: { translation: es },
            nl: { translation: nl }
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