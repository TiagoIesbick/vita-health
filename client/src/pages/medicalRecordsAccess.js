import { Link } from "react-router-dom";
import { useUser } from "../providers/userContext";
import { useInfiniteMedicalRecords } from "../hooks/hooks";
import { useNavigate } from "react-router-dom";
import { useUserQuery } from '../hooks/hooks';
import CountDown from "../components/countdown";
import LoadingSkeleton from "../components/skeleton";
import MedicalRecordsCard from "../components/medicalRecordsCard";
import AIChat from "../components/aiChat";


const MedicalRecordsAccess = () => {
    const navigate = useNavigate();
    const { user, patient, setPatient, showMessage } = useUser();
    const { userDetail, loadingUser, errorUser } = useUserQuery(patient.userId);
    const { allRecords, medicalRecords, loading, error, loader } = useInfiniteMedicalRecords();

    if ((loading || loadingUser) && allRecords.length === 0) {
        return <LoadingSkeleton />
    };

    if (error || errorUser) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <>
            { allRecords.length > 0 && !loadingUser && <AIChat allRecords={allRecords} user={user} /> }
            <MedicalRecordsCard
                title="Health History"
                allRecords={allRecords}
                medicalRecords={medicalRecords}
                loading={loading}
                loader={loader}
                emptyMessage={
                    <>
                        <p><span className="font-bold">{userDetail?.firstName + ' ' + userDetail?.lastName}</span> has no health history yet.</p>
                        <p>Start by adding new health data <Link to="/insert-medical-record">here</Link> to begin building the patient’s medical records.</p>
                    </>
                }
            >
                <CountDown patient={patient} setPatient={setPatient} showMessage={showMessage} patientDetail={userDetail} />
            </MedicalRecordsCard>
        </>
    );
};
export default MedicalRecordsAccess;
