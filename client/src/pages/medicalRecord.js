import { Card } from "primereact/card";
import { useParams } from 'react-router';
import { useMedicalRecord } from '../hooks/hooks';
import { localDateTime } from "../utils/utils";
import { useUser } from "../providers/userContext";
import { useNavigate } from 'react-router';
import LoadingSkeleton from "../components/skeleton";
import FileGallery from "../components/fileGallery";


const MedicalRecord = () => {
    const navigate = useNavigate();
    const { showMessage } = useUser();
    const { recordId } = useParams();
    const { medicalRecord, loading, error } = useMedicalRecord(recordId);


    console.log(medicalRecord);
    if (loading) return <LoadingSkeleton />;

    if (error) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <>
            {!loading && !medicalRecord
                ?   <Card className="flex justify-content-center align-items-center card-min-height">
                        No Data Available
                    </Card>
                :   <Card
                        title={medicalRecord.recordType.recordName}
                        subTitle={
                            <i className="pi pi-calendar-clock text-xl font-medium">
                                {' ' + localDateTime(medicalRecord.dateCreated, 'minus').toLocaleDateString() + ' ' + localDateTime(medicalRecord?.dateCreated, 'minus').toLocaleTimeString(undefined, {timeStyle:'short'})}
                            </i>
                        }
                        className="flex justify-content-center align-items-center card-min-height"
                    >
                        <div dangerouslySetInnerHTML={{__html: medicalRecord.recordData}} />

                        {medicalRecord.files && medicalRecord.files.length > 0 &&
                            <>
                                <div className="flex flex-row align-items-center gap-2 justify-content-center">
                                    <i className="pi pi-folder-open text-xl font-semi-bold text-primary"></i>
                                    <h3 className="flex justify-content-center">Files Gallery</h3>
                                </div>
                                <FileGallery files={medicalRecord.files} />
                            </>
                        }
                    </Card>
            }
        </>
    );
};
export default MedicalRecord;