import { ListBox } from 'primereact/listbox';
import { OverlayPanel } from 'primereact/overlaypanel';
import { addLocale, locale } from 'primereact/api';
import { useEffect, useRef, useState } from 'react';
import './localLanguage.css';


const primeReactLocaleFiles = {
    'en': () => import('../../node_modules/primelocale/en.json'),
    'pt-br': () => import('../../node_modules/primelocale/pt-br.json'),
    // Add more locales as needed
};

const browserLocale = navigator.languages?.[0] || navigator.language;

const languages = [
    { name: 'EN', code: 'US' },
    { name: 'pt-BR', code: 'BR' }
];

const initialLanguage = browserLocale === 'pt-BR' ? languages[1] : languages[0];


const loadLocaleFile = async (language) => {
    let localeFiles = {}

    if (Object.prototype.hasOwnProperty.call(primeReactLocaleFiles, language)) {
        const fileModule = await primeReactLocaleFiles[language]();
        localeFiles = fileModule.default;
    } else {
        const fileModule = await primeReactLocaleFiles['en']();
        localeFiles = fileModule.default;
    };

    return localeFiles;
};

const initLocale = async (language) => {
    const languageLower = language.toLowerCase();
    const localeFile = await loadLocaleFile(languageLower);
    const rootKey = Object.keys(localeFile)[0];
    let newLocale = localeFile[rootKey];

    // Add custom overrides
    // newLocale['Last Record'] = 'Último Registro'; // Example custom translation

    // Register the locale with PrimeReact
    addLocale(languageLower, newLocale);

    // Set the active locale
    locale(languageLower);

    return languageLower;
};

const countryTemplate = (option) => {
    return (
        <div className="flex align-items-center">
            <img alt={option.name} src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`flag flag-${option.code.toLowerCase()}`} style={{ width: '1.25rem', marginRight: '.5rem' }}/>
            <div>{option.name}</div>
        </div>
    );
};

const LocalLanguage = () => {
    const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
    const op = useRef(null);

    useEffect(() => {
        const initializeLanguage = async () => {
            await initLocale(initialLanguage.name.toLowerCase());
        };
        initializeLanguage();
    }, []);

    console.log(browserLocale);
    console.log(primeReactLocaleFiles);

    const onLocaleChange = async (e) => {
        const localeKey = e.value;

        if (!localeKey) {
            return;
        };

        await initLocale(localeKey.name.toLowerCase())
        setSelectedLanguage(localeKey);
    };


    return (
        <div className="card flex justify-content-center">
            <img alt='language' src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`flag flag-${selectedLanguage.code.toLocaleLowerCase()}`} style={{ width: '1.25rem', marginRight: '.5rem' }} onClick={(e) => op.current.toggle(e)}/>
            <OverlayPanel ref={op} className='languages-overlay'>
                <ListBox value={selectedLanguage} onChange={onLocaleChange} options={languages} optionLabel="name"
                    itemTemplate={countryTemplate} className="w-full border-none" listStyle={{ maxHeight: '250px' }}
                />
            </OverlayPanel>
        </div>
    );
};
export default LocalLanguage;