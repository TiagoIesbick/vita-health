import { addLocale, locale } from 'primereact/api';
import { merge } from 'lodash';


const primeReactLocaleFiles = {
    en: () => import('../../node_modules/primelocale/en.json'),
    'pt-br': () => import('../../node_modules/primelocale/pt-br.json'),
    // Add more locales as needed
};

const customLocaleFiles = {
    en: () => import('./languages/en-custom.json'),
    'pt-br': () => import('./languages/pt-br-custom.json'),
};

const loadLocaleFile = async (language) => {
    let localeFiles = {}

    if (primeReactLocaleFiles[language]) {
        const [baseFile, customFile] = await Promise.all([
            primeReactLocaleFiles[language](),
            customLocaleFiles[language]?.() ?? {}
        ]);
        localeFiles = merge(baseFile.default, customFile.default);
    } else {
        const [baseFile, customFile] = await Promise.all([
            primeReactLocaleFiles.en(),
            customLocaleFiles.en?.() ?? {}
        ]);
        localeFiles = merge(baseFile.default, customFile.default);
    };

    return localeFiles;
};

export const initLocale = async (language) => {
    const languageLower = language.toLowerCase();
    const localeFile = await loadLocaleFile(languageLower);
    const rootKey = Object.keys(localeFile)[0];
    const newLocale = localeFile[rootKey];
    addLocale(languageLower, newLocale);
    locale(languageLower);
    return newLocale;
};