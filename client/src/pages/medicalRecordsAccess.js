import { useUser } from "../providers/userContext";
import { useMedicalRecords } from "../hooks/hooks";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import LoadingSkeleton from "../components/skeleton";


const MedicalRecordsAccess = () => {
    const navigate = useNavigate();
    const { patient, showMessage } = useUser();
    const { medicalRecords, loading, error } = useMedicalRecords();

    console.log(patient);
    if (loading) {
        return <LoadingSkeleton />
    };
    if (error) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };
    return (
        <Card
            title="Patient Medical Records"
            className="flex justify-content-center align-items-center card-min-height"
        >
            <pre>
                {JSON.stringify(medicalRecords, undefined, 2)}
            </pre>
        </Card>
    );
};
export default MedicalRecordsAccess;
