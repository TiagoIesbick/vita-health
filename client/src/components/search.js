import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRef, useState, useEffect } from 'react';
import { useSearchFiles, useSearchMedicalRecords } from '../hooks/hooks';
import { useOverlayListener } from 'primereact/hooks';
import FileGallery from './fileGallery';
import SearchList from './searchList';


const Search = () => {
    const overlayRef = useRef(null);
    const searchInput = useRef(null);
    const [term, setTerm] =  useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [files, setFiles] = useState([]);
    const [show, setShow] = useState(false);
    const { searchMedicalRecords, loading, error } = useSearchMedicalRecords(debouncedTerm);
    const { searchFiles, loadingFiles, errorFiles } = useSearchFiles(debouncedTerm);

    const handleEvents = (_, options) => {
        if (options.valid) {
            overlayRef.current.hide();
            setTerm('');
            searchInput.current.blur();
        };
      };

    const [bindOverlayListener, unbindOverlayListener] = useOverlayListener({
        target: searchInput.current,
        overlay: overlayRef.current,
        listener: handleEvents,
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

    // console.log(searchFiles);

    return (
        <div className='search-field'>
            <IconField iconPosition="left" >
                <InputIcon className="pi pi-search" />
                <InputText placeholder="Search" value={term} onChange={handleTerm} ref={searchInput}/>
            </IconField>
            <OverlayPanel ref={overlayRef} closeOnEscape className='overflow-y-auto overflow-x-hidden'>
                {searchMedicalRecords?.length ? (
                    <>
                        <h4>Health Data</h4>
                        <SearchList searchResults={searchMedicalRecords} setTerm={setTerm} />
                    </>
                ) : null}
                {searchFiles?.length ? (
                    <>
                        <h4>Files</h4>
                        <SearchList searchResults={searchFiles} resultsType={'files'} setTerm={setTerm} setFiles={setFiles} setShow={setShow}/>
                    </>
                ) : null}
            </OverlayPanel>
            <FileGallery files={files} layout={'thumbnail'} show={show} setShow={setShow}/>
        </div>

    );
};
export default Search;