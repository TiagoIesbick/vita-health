import { useMedicalRecords } from "../hooks/hooks";
import { Card } from "primereact/card";
import { Timeline } from 'primereact/timeline';
import { useUser } from "../providers/userContext";
import { useNavigate } from 'react-router';
import { Link } from "react-router-dom";
import LoadingSkeleton from "../components/skeleton";
import { customizedContent, customizedMarker } from "../utils/utils";
import './medicalRecords.css';


const MedicalRecords = () => {
    const navigate = useNavigate();
    const { showMessage } = useUser();
    const { medicalRecords, loading, error } = useMedicalRecords();

    if (loading) {
        return <LoadingSkeleton />
    };

    if (error) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <Card
            title="Health History"
            className="flex justify-content-center align-items-center card-min-height medical-record"
        >
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
export default MedicalRecords;
