import { classNames } from 'primereact/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserDoctor, faNotesMedical } from '@fortawesome/free-solid-svg-icons';
import { customizedMarker, stripHtmlTags } from '../utils/utils';
import { useNavigate } from 'react-router';


const SearchList = ({ searchResults, resultsType='health-data', setTerm, setFiles=()=>{}, setShow=()=>{} }) => {
    const navigate = useNavigate();

    if (!searchResults) return;

    const searchItem = (result, index) => {
        const handleClick = () => {
            if (resultsType === 'health-data') {
                navigate(`/medical-record/${result.recordId}`);
            } else {
                navigate(`/medical-record/${result.recordId}`);
                setFiles([result]);
                setShow(true);
            };
            setTerm('');
        };

        return (
            <div className={
                classNames("col-12 hover:surface-ground cursor-pointer", {
                    'border-top-1 surface-border': index !== 0
                })}
                key={resultsType === 'health-data' ? result.recordId : result.fileName}
                onClick={handleClick}
            >
                <div className='flex flex-wrap mt-2 gap-3 align-items-center max-w-full' >
                    {resultsType === 'health-data' ?
                        <>
                            <span className='flex flex-row gap-1 align-items-center max-w-full'>
                                {customizedMarker(
                                    { recordType: { recordName : stripHtmlTags(result.recordTypeName)}}
                                )}
                                <span
                                    className='text-overflow-ellipsis white-space-nowrap overflow-hidden'
                                    dangerouslySetInnerHTML={{ __html: result.recordTypeName }}
                                ></span>
                            </span>
                            <span className='flex flex-row gap-1 align-items-center max-w-full'>
                                <FontAwesomeIcon icon={faUserDoctor} />
                                <span
                                    className='text-overflow-ellipsis white-space-nowrap overflow-hidden'
                                    dangerouslySetInnerHTML={{ __html: result.doctorFullName }}
                                ></span>
                            </span>
                            <span className='flex flex-row gap-1 align-items-center max-w-full'>
                                <FontAwesomeIcon icon={faNotesMedical} />
                                <span
                                    className='text-overflow-ellipsis white-space-nowrap overflow-hidden'
                                    dangerouslySetInnerHTML={{ __html: result.recordData }}
                                ></span>
                            </span>
                        </> :
                        <>
                            <span className='flex flex-row gap-1 align-items-center max-w-full'>
                                <i className={
                                    result.mimeType === "application/pdf" ? 'pi pi-file-pdf' : 'pi pi-image'
                                }></i>
                                <span
                                    className='text-overflow-ellipsis white-space-nowrap overflow-hidden'
                                    dangerouslySetInnerHTML={{ __html: result.textContent }}
                                ></span>
                            </span>
                        </>
                    }
                </div>
            </div>
        );
    };

    return (
        <div>
            {searchResults.map((result, index) => searchItem(result, index))}
        </div>
    );
};
export default SearchList;