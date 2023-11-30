import i18n from 'i18next';

const en = require("./languages/en.js").en;

i18n
    .init({
        resources: {
            en: {
                translation: en
            },
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;