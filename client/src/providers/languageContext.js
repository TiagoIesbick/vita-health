import { createContext, useContext, useEffect, useState } from "react";
import { initLocale } from "../utils/locale";


const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const browserLocale = navigator.languages?.[0] || navigator.language;
    const initialLanguage = browserLocale === "pt-BR" ? "pt-br" : "en-us";
    const [language, setLanguage] = useState(initialLanguage);
    const [translations, setTranslations] = useState(null);

    useEffect(() => {
        const initializeLanguage = async () => {
            const newLocale = await initLocale(language);
            setTranslations(newLocale);
        };
        initializeLanguage();
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, translations }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
