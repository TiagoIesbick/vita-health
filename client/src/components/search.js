import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRef, useState, useEffect } from 'react';
import { useSearchMedicalRecords } from '../hooks/hooks';


const Search = () => {
    const op = useRef(null);
    const [term, setTerm] =  useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const { searchMedicalRecords, loading, error } = useSearchMedicalRecords(debouncedTerm);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedTerm(term);
        }, 300);
        return () => clearTimeout(handler);
    }, [term]);

    const handleTerm = (e) => {
        setTerm(e.target.value);
        if (!op.current.isVisible() && e.target.value) {
            op.current.show(e);
        } else if (op.current.isVisible() && !e.target.value) {
            op.current.hide();
        };
    };

    return (
        <>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText placeholder="Search" onChange={handleTerm}/>
            </IconField>
            <OverlayPanel ref={op} closeOnEscape className='max-w-full'>
                <ul>
                {searchMedicalRecords && searchMedicalRecords.map(result => (
                    <li key={result.recordId} dangerouslySetInnerHTML={{ __html: result.recordData }}></li>
                ))}
                </ul>
            </OverlayPanel>
        </>

    );
};
export default Search;