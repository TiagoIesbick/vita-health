import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Dialog } from 'primereact/dialog';
import { useRef, useState, useEffect } from 'react';
import { useSearchFiles, useSearchMedicalRecords } from '../hooks/hooks';
import { useOverlayListener } from 'primereact/hooks';
import SearchList from './searchList';
import FileItem from './fileItem';
import './search.css';


const Search = () => {
    const overlayRef = useRef(null);
    const searchInput = useRef(null);
    const [term, setTerm] =  useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [file, setFile] = useState([]);
    const [visible, setVisible] = useState(false);
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

    const fileHeight = 'calc(100vh - (100vh/6))';
    const fileWidth = 'calc(100vw - (100vw/6))';

    return (
        <>
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
                            <SearchList searchResults={searchFiles} resultsType={'files'} setTerm={setTerm} setFile={setFile} setVisible={setVisible}/>
                        </>
                    ) : null}
                </OverlayPanel>
            </div>
            <Dialog
                visible={visible}
                modal
                maskClassName="p-galleria-mask"
                closeOnEscape
                onHide={() => {if (!visible) return; setVisible(false); }}
                content={({ hide }) => (
                    <div className='p-galleria custom-galleria'>
                        <Button onClick={hide} className="p-galleria-close p-link" aria-label="Close" >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="p-icon p-galleria-close-icon"
                                aria-hidden="true" data-pc-section="closeicon"
                            >
                                <path
                                    d="M8.01186 7.00933L12.27 2.75116C12.341 2.68501 12.398 2.60524 12.4375 2.51661C12.4769 2.42798 12.4982 2.3323 12.4999 2.23529C12.5016 2.13827 12.4838 2.0419 12.4474 1.95194C12.4111 1.86197 12.357 1.78024 12.2884 1.71163C12.2198 1.64302 12.138 1.58893 12.0481 1.55259C11.9581 1.51625 11.8617 1.4984 11.7647 1.50011C11.6677 1.50182 11.572 1.52306 11.4834 1.56255C11.3948 1.60204 11.315 1.65898 11.2488 1.72997L6.99067 5.98814L2.7325 1.72997C2.59553 1.60234 2.41437 1.53286 2.22718 1.53616C2.03999 1.53946 1.8614 1.61529 1.72901 1.74767C1.59663 1.88006 1.5208 2.05865 1.5175 2.24584C1.5142 2.43303 1.58368 2.61419 1.71131 2.75116L5.96948 7.00933L1.71131 11.2675C1.576 11.403 1.5 11.5866 1.5 11.7781C1.5 11.9696 1.576 12.1532 1.71131 12.2887C1.84679 12.424 2.03043 12.5 2.2219 12.5C2.41338 12.5 2.59702 12.424 2.7325 12.2887L6.99067 8.03052L11.2488 12.2887C11.3843 12.424 11.568 12.5 11.7594 12.5C11.9509 12.5 12.1346 12.424 12.27 12.2887C12.4053 12.1532 12.4813 11.9696 12.4813 11.7781C12.4813 11.5866 12.4053 11.403 12.27 11.2675L8.01186 7.00933Z"
                                    fill="currentColor"
                                ></path>
                            </svg>
                        </Button>
                        <FileItem
                            file={file}
                            fileHeight={fileHeight}
                            fileWidth={fileWidth}
                        />
                    </div>
                )}
            >
            </Dialog>
        </>
    );
};
export default Search;