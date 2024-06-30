import { useUser } from "../providers/userContext";
import { useMedicalRecordsByPatientId } from "../hooks/hooks";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";


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
        <Card
            title="Dados Médicos"
            className="flex justify-content-center align-items-center"
            style={{minHeight: 'calc(100vh - 128px)'}}
        >
            <pre>
                {JSON.stringify(medicalRecords, undefined, 2)}
            </pre>
        </Card>
    );
};
export default MedicalRecordsAccess;
