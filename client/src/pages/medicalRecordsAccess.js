import { Link } from "react-router-dom";
import { useUser } from "../providers/userContext";
import { useInfiniteMedicalRecords } from "../hooks/hooks";
import { useNavigate } from "react-router-dom";
import { useUserQuery } from '../hooks/hooks';
import { useLanguage } from "../providers/languageContext";
import CountDown from "../components/countdown";
import LoadingSkeleton from "../components/skeleton";
import MedicalRecordsCard from "../components/medicalRecordsCard";
import AIChat from "../components/aiChat";


const MedicalRecordsAccess = () => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { user, patient, setPatient, showMessage } = useUser();
    const { userDetail, loadingUser, errorUser } = useUserQuery(patient.userId);
    const { allRecords, medicalRecords, loading, error, loader } = useInfiniteMedicalRecords();

    if ((loading || loadingUser) && allRecords.length === 0) {
        return <LoadingSkeleton />
    };

    if (error || errorUser) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    return (
        <>
            { allRecords.length > 0 && !loadingUser && <AIChat allRecords={allRecords} user={user} /> }
            <MedicalRecordsCard
                title={translations?.healthHistory?.title}
                allRecords={allRecords}
                medicalRecords={medicalRecords}
                loading={loading}
                loader={loader}
                emptyMessage={
                    <>
                        <p><span className="font-bold">{userDetail?.firstName + ' ' + userDetail?.lastName}</span> {translations?.healthHistory?.emptyMessage?.firstP2nd}</p>
                        <p>{translations?.healthHistory?.emptyMessage?.secondP1st} <Link to="/insert-medical-record">{translations?.here}</Link> {translations?.healthHistory?.emptyMessage?.secondP2nd}</p>
                    </>
                }
            >
                <CountDown patient={patient} setPatient={setPatient} showMessage={showMessage} patientDetail={userDetail} />
            </MedicalRecordsCard>
        </>
    );
};
export default MedicalRecordsAccess;
