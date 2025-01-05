import { Link } from "react-router-dom";
import { useNavigate } from 'react-router';
import { useInfiniteMedicalRecords } from "../hooks/hooks";
import { useUser } from "../providers/userContext";
import { useLanguage } from "../providers/languageContext";
import LoadingSkeleton from "../components/skeleton";
import MedicalRecordsCard from "../components/medicalRecordsCard";
import AIChat from "../components/aiChat";


const MedicalRecords = () => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { user, showMessage } = useUser();
    const { allRecords, medicalRecords, loading, error, loader } = useInfiniteMedicalRecords();


    if (loading && allRecords.length === 0) {
        return <LoadingSkeleton />
    };

    if (error) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    console.log('[allRecords]:',allRecords);

    return (
        <>
            { allRecords.length > 0 && <AIChat allRecords={allRecords} user={user} /> }
            <MedicalRecordsCard
                title={translations?.healthHistory?.title}
                allRecords={allRecords}
                medicalRecords={medicalRecords}
                loading={loading}
                loader={loader}
                emptyMessage={
                    <>
                        <p>{translations?.healthHistory?.noData?.firstP}</p>
                        <p>{translations?.healthHistory?.noData?.secondP1st} <Link to="/insert-medical-record">{translations?.here}</Link> {translations?.healthHistory?.noData?.secondP2nd}</p>
                        <p>{translations?.healthHistory?.noData?.thirdP1st} <Link to="/generate-access-token">{translations?.here}</Link> {translations?.healthHistory?.noData?.thirdP2nd}</p>
                    </>
                }
            />
        </>
    );
};
export default MedicalRecords;
