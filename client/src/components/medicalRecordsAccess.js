import { useUser } from "../providers/userContext";
import { useMedicalRecordsByPatientId } from "../hooks/hooks";
import { useNavigate } from "react-router-dom";


const MedicalRecordsAccess = () => {
    const navigate = useNavigate();
    const { patient, showMessage } = useUser();
    const { medicalRecords, loading, error } = useMedicalRecordsByPatientId(patient.patientId);
    if (loading) {
        return <>Loading...</>
    };
    if (error) {
        navigate('/');
        showMessage('error', 'Error', 'Dados não disponíveis', true);
    };
    return (
        <pre>
            {JSON.stringify(medicalRecords, undefined, 2)}
        </pre>
    );
};
export default MedicalRecordsAccess;
