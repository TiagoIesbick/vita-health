import { Card } from "primereact/card";
import { useParams } from 'react-router';
import { useMedicalRecord } from '../hooks/hooks';
import LoadingSkeleton from "../components/skeleton";


const MedicalRecord = () => {
    const { recordId } = useParams();
    const { medicalRecord, loading, error } = useMedicalRecord(recordId);

    console.log(medicalRecord);
    if (loading) return <LoadingSkeleton />;

    return (
        <Card className="card-min-height">Medical Record</Card>
    );
};
export default MedicalRecord;