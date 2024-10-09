import { Card } from "primereact/card";
import { useParams } from 'react-router';
import { useMedicalRecord } from '../hooks/hooks';
import { localDateTime } from "../utils/utils";
import LoadingSkeleton from "../components/skeleton";
import FileGallery from "../components/fileGallery";


const MedicalRecord = () => {
    const { recordId } = useParams();
    const { medicalRecord, loading, error } = useMedicalRecord(recordId);


    console.log(medicalRecord);
    if (loading) return <LoadingSkeleton />;

    return (
        <Card
            title={medicalRecord.recordType.recordName}
            subTitle={
                <i className="pi pi-calendar-clock text-xl font-medium">
                    {' ' + localDateTime(medicalRecord.dateCreated, 'minus').toLocaleDateString() + ' ' + localDateTime(medicalRecord.dateCreated, 'minus').toLocaleTimeString(undefined, {timeStyle:'short'})}
                </i>
            }
            className="flex justify-content-center align-items-center card-min-height"
        >
            <div dangerouslySetInnerHTML={{__html: medicalRecord.recordData}} />

            {medicalRecord.files && medicalRecord.files.length > 0 && <FileGallery files={medicalRecord.files} />}

        </Card>
    );
};
export default MedicalRecord;