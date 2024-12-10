import { ListBox } from 'primereact/listbox';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useLanguage } from '../providers/languageContext';
import { useRef } from 'react';
import flag_placeholder from '../assets/images/flag_placeholder.png';
import './localLanguage.css';


const languages = [
    { name: 'en-US', code: 'US' },
    { name: 'pt-BR', code: 'BR' }
];

const countryTemplate = (option) => {
    return (
        <div className="flex align-items-center">
            <img
                alt={option.name}
                src={flag_placeholder}
                className={`flag flag-${option.code.toLowerCase()}`}
                style={{ width: '1.25rem', marginRight: '.5rem' }}
            />
            <div>{option.name}</div>
        </div>
    );
};

const LocalLanguage = ({ expanded, screenWidth }) => {
    const { language, setLanguage } = useLanguage();
    const selectedLanguage = languages.find((lang) => lang.name.toLowerCase() === language);
    const op = useRef(null);

    const onLocaleChange = async (e) => {
        const localeKey = e.value;
        op.current.toggle(e);
        if (!localeKey) return;
        setLanguage(localeKey.name.toLowerCase());
    };

    return (
        <>
            <img
                alt='language'
                src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
                className={`flag flag-${selectedLanguage.code.toLocaleLowerCase()}`}
                style={{
                    width: '1.25rem',
                    margin: screenWidth <= 375 ? '0' : '0 0.875rem',
                    cursor: 'pointer',
                    display: expanded ? 'none' : undefined
                }}
                onClick={(e) => op.current.toggle(e)}
            />
            <OverlayPanel ref={op} className='languages-overlay'>
                <ListBox
                    value={selectedLanguage}
                    onChange={onLocaleChange}
                    options={languages}
                    optionLabel="name"
                    itemTemplate={countryTemplate}
                    className="w-full border-none"
                    listStyle={{ maxHeight: '250px' }}
                />
            </OverlayPanel>
        </>
    );
};
export default LocalLanguage;