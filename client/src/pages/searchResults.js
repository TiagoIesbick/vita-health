import { Card } from "primereact/card";
import { useLocation } from 'react-router-dom';
import { useSearchFiles, useSearchMedicalRecords } from '../hooks/hooks';
import { useNavigate } from 'react-router';
import { useUser } from "../providers/userContext";
import { useFileContext } from '../providers/fileContext';
import { useLanguage } from "../providers/languageContext";
import LoadingSkeleton from "../components/skeleton";
import SearchList from '../components/searchList';
import './searchResults.css';


const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('query');
    const { language, translations } = useLanguage();
    const { showMessage } = useUser();
    const { setFile, setFileVisible } = useFileContext();
    const { searchMedicalRecords, loading, error } = useSearchMedicalRecords(query, language);
    const { searchFiles, loadingFiles, errorFiles } = useSearchFiles(query);

    if (loading || loadingFiles) {
        return <LoadingSkeleton />
    };

    if (error || errorFiles) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    return (
        <Card
            title={`Search Results for "${query}"`}
            className="flex justify-content-center align-items-center card-min-height search-results"
        >
            {searchMedicalRecords?.length ? (
                <>
                    <h4>{translations?.search?.healthData}</h4>
                    <SearchList searchResults={searchMedicalRecords} />
                </>
            ) : null}
            {searchFiles?.length ? (
                <>
                    <h4>{translations?.search?.files}</h4>
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
