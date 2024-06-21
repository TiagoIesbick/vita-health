import { useMedicalRecords } from "../hooks/hooks";

const MedicalRecords = () => {
    const { medicalRecords, loading, error } = useMedicalRecords();

    console.log('[Medical Records]:', medicalRecords);
    if (loading) {
        return <div>Loading...</div>
    };
    if (error) {
        return <div>Data Unavailable</div>
    };
    return (
        <pre>
            {JSON.stringify(medicalRecords, undefined, 2)}
        </pre>
    );
};
export default MedicalRecords;
