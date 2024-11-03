import { classNames } from 'primereact/utils';

const SearchList = ({ searchResults }) => {
    if (!searchResults) return;

    const searchItem = (result, index) => (
        <div className="col-12" key={result.recordId}>
            <div className={classNames('flex flex-column gap-1', { 'border-top-1 surface-border': index !== 0 })}>
                <div className='flex font-semibold mt-2 justify-content-center gap-3 align-items-center h-3rem' >
                    <div dangerouslySetInnerHTML={{ __html: result.recordData }}></div>
                    <div dangerouslySetInnerHTML={{ __html: result.doctorFullName }}></div>
                    <div dangerouslySetInnerHTML={{ __html: result.recordTypeName }}></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid grid-nogutter">
            {searchResults.map((result, index) => searchItem(result, index))}
        </div>
    );
};
export default SearchList;