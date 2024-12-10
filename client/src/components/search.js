import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useLanguage } from "../providers/languageContext";
import { useRef, useState, useEffect } from 'react';
import { useSearchFiles, useSearchMedicalRecords } from '../hooks/hooks';
import { useOverlayListener } from 'primereact/hooks';
import { useNavigate } from 'react-router-dom';
import { useFileContext } from '../providers/fileContext';
import SearchList from './searchList';
import './search.css';


const Search = ({ expanded, setExpanded, screenWidth }) => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const overlayRef = useRef(null);
    const searchInput = useRef(null);
    const [term, setTerm] =  useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const { setFile, setFileVisible } = useFileContext();
    const { searchMedicalRecords, loading, error } = useSearchMedicalRecords(debouncedTerm);
    const { searchFiles, loadingFiles, errorFiles } = useSearchFiles(debouncedTerm);

    const handleButtonClick = () => setExpanded(!expanded);

    const handleEvents = () => {
        overlayRef.current.hide();
        setTerm('');
        setExpanded(false);
        searchInput?.current?.blur();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && term) {
            navigate(`/search-results?query=${term}`);
            handleEvents();
        }
    };

    const handleOverlayEvents = (_, options) => {
        if (options.valid) {
            handleEvents();
        };
    };

    const [bindOverlayListener, unbindOverlayListener] = useOverlayListener({
        target: searchInput.current,
        overlay: overlayRef.current,
        listener: handleOverlayEvents,
        options: { passive: true },
        when: overlayRef.current?.isVisible()
    });

    useEffect(() => {
        bindOverlayListener();
        return () => {
          unbindOverlayListener();
        };
    }, [bindOverlayListener, unbindOverlayListener]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedTerm(term);
        }, 300);
        return () => clearTimeout(handler);
    }, [term]);

    const handleTerm = (e) => {
        setTerm(e.target.value);
        if (!overlayRef.current.isVisible() && e.target.value) {
            overlayRef.current.show(e);
        } else if (overlayRef.current.isVisible() && !e.target.value) {
            overlayRef.current.hide();
        };
    };

    useEffect(() => {
        if (expanded) searchInput?.current?.focus();

        const handleClickOutside = (e) => {
            if (
                searchInput.current &&
                !searchInput.current.contains(e.target) &&
                !overlayRef.current?.getElement()?.contains(e.target) &&
                expanded
            ) {
                setExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [expanded, setExpanded]);

    return (
        <>
            <div
                style={{
                    marginLeft: !expanded && screenWidth > 600 ? '0.6rem' : undefined
                }}
            >
                {!expanded && screenWidth <= 600 && (
                    <Button
                        icon="pi pi-search"
                        rounded text
                        aria-label={translations?.search?.search}
                        className="mobile-search-button"
                        onClick={handleButtonClick}
                    />
                )}
                {(expanded || screenWidth > 600) && (
                    <IconField
                        iconPosition="left"
                        style={{
                            minWidth: expanded ? 'calc(100vw - (100vw/6) - 48px - 2.5rem)' : undefined
                        }}
                    >
                        <InputIcon className={loading || loadingFiles ? "pi pi-spin pi-spinner-dotted" : "pi pi-search"} />
                        <InputText
                            placeholder={translations?.search?.search}
                            value={term}
                            onChange={handleTerm}
                            onKeyDown={handleKeyDown}
                            ref={searchInput}
                            onBlur={() => setExpanded(false)}
                            className='w-full'
                        />
                    </IconField>
                )}
                <OverlayPanel
                    ref={overlayRef}
                    closeOnEscape
                    className='overflow-y-auto overflow-x-hidden'
                    style={{
                        width: screenWidth <= 600 ? 'calc(61vw + (100vw/12) + 48px)' : undefined,
                        minWidth: screenWidth > 600 ? '300px' : undefined,
                        maxWidth: screenWidth > 600 ? '50%' : undefined,
                        maxHeight: '80dvh'
                    }}
                >
                    {searchMedicalRecords?.length ? (
                        <>
                            <h4>{translations?.search?.healthData}</h4>
                            <SearchList searchResults={searchMedicalRecords} setTerm={setTerm} />
                        </>
                    ) : null}
                    {searchFiles?.length ? (
                        <>
                            <h4>{translations?.search?.files}</h4>
                            <SearchList searchResults={searchFiles} resultsType={'files'} setTerm={setTerm} setFile={setFile} setVisible={setFileVisible}/>
                        </>
                    ) : null}
                    {!searchMedicalRecords?.length && !searchFiles?.length &&
                        <p>{term}</p>
                    }
                    {error || errorFiles ? <p>{translations?.error?.errorMessage}</p> : null}
                </OverlayPanel>
            </div>
        </>
    );
};
export default Search;
