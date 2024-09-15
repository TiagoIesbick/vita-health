import { useUser } from "../providers/userContext";
import { useMedicalRecords } from "../hooks/hooks";
import { useNavigate } from "react-router-dom";
import { useUserQuery } from '../hooks/hooks';
import { Card } from "primereact/card";
import { Timeline } from 'primereact/timeline';
import { Link } from "react-router-dom";
import LoadingSkeleton from "../components/skeleton";
import { customizedContent, customizedMarker } from "../utils/utils";
import CountDown from "../components/countdown";
import './medicalRecords.css';


const MedicalRecordsAccess = () => {
    const navigate = useNavigate();
    const { patient, setPatient, showMessage } = useUser();
    const { userDetail, loadingUser, errorUser } = useUserQuery(patient.userId);
    const { medicalRecords, loading, error } = useMedicalRecords();

    if (loading || loadingUser) {
        return <LoadingSkeleton />
    };

    if (error || errorUser) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <Card
            title="Health History"
            className="flex justify-content-center align-items-center card-min-height medical-record"
        >
            <CountDown patient={patient} setPatient={setPatient} showMessage={showMessage} patientDetail={userDetail} />
            {!medicalRecords || medicalRecords.length === 0 ?
                <>
                    <p>You have no health history yet.</p>
                    <p>Start by adding your health data <Link to="/insert-medical-record" >here</Link> to begin building your records.</p>
                    <p>Alternatively, generate a token <Link to="/generate-access-token" >here</Link> to share with your health professional so they can add new information.</p>
                </> :
                <Timeline value={medicalRecords} align="alternate" className="customized-timeline" marker={customizedMarker} content={customizedContent} />
            }
        </Card>
    );
};
export default MedicalRecordsAccess;
