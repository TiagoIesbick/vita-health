import { useMedicalRecords } from "../hooks/hooks";
import { Card } from "primereact/card";

const MedicalRecords = () => {
    const { medicalRecords, loading, error } = useMedicalRecords();

    if (loading) {
        return <div>Loading...</div>
    };
    if (error) {
        return <div>Data Unavailable</div>
    };
    return (
        <Card
            title="Medical Records"
            className="flex justify-content-center align-items-center"
            style={{minHeight: 'calc(100vh - 128px)'}}
        >
            <pre>
                {JSON.stringify(medicalRecords, undefined, 2)}
            </pre>
        </Card>
    );
};
export default MedicalRecords;
