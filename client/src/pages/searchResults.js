import { Card } from "primereact/card";
import { useLocation } from 'react-router-dom';
import { useSearchFiles, useSearchMedicalRecords } from '../hooks/hooks';
import { useNavigate } from 'react-router';
import { useUser } from "../providers/userContext";
import { useFileContext } from '../providers/fileContext';
import LoadingSkeleton from "../components/skeleton";
import SearchList from '../components/searchList';


const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('query');
    const { showMessage } = useUser();
    const { setFile, setFileVisible } = useFileContext();
    const { searchMedicalRecords, loading, error } = useSearchMedicalRecords(query);
    const { searchFiles, loadingFiles, errorFiles } = useSearchFiles(query);

    if (loading || loadingFiles) {
        return <LoadingSkeleton />
    };

    if (error || errorFiles) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <Card
            title={`Search Results for "${query}"`}
            className="flex justify-content-center align-items-center card-min-height"
        >
            {searchMedicalRecords?.length ? (
                <>
                    <h4>Health Data</h4>
                    <SearchList searchResults={searchMedicalRecords} />
                </>
            ) : null}
            {searchFiles?.length ? (
                <>
                    <h4>Files</h4>
                    <SearchList searchResults={searchFiles} resultsType={'files'} setFile={setFile} setVisible={setFileVisible}/>
                </>
            ) : null}
            {!searchMedicalRecords?.length && !searchFiles?.length &&
                <p>No data found for "{query}"</p>
            }
        </Card>
    );
};
export default SearchResults;
