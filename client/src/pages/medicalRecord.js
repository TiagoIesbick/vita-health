import { Card } from "primereact/card";
import { Tooltip } from 'primereact/tooltip';
import { useParams } from 'react-router';
import { useMedicalRecord } from '../hooks/hooks';
import { localDateTime } from "../utils/utils";
import { useUser } from "../providers/userContext";
import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserDoctor } from '@fortawesome/free-solid-svg-icons';
import LoadingSkeleton from "../components/skeleton";
import FileGallery from "../components/fileGallery";


const MedicalRecord = () => {
    const navigate = useNavigate();
    const { showMessage } = useUser();
    const { recordId } = useParams();
    const { medicalRecord, loading, error } = useMedicalRecord(recordId);

    if (loading) return <LoadingSkeleton />;

    if (error) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };
    console.log(medicalRecord);

    return (
        <>
            {!loading && !medicalRecord
                ?   <Card className="flex justify-content-center align-items-center card-min-height">
                        No Data Available
                    </Card>
                :   <Card
                        title={medicalRecord.recordType.recordName}
                        subTitle={
                            <>
                                <i className="pi pi-calendar-clock text-xl font-medium flex gap-1">
                                    {localDateTime(medicalRecord.dateCreated, 'minus').toLocaleDateString() + ' ' + localDateTime(medicalRecord?.dateCreated, 'minus').toLocaleTimeString(undefined, {timeStyle:'short'})}
                                </i>
                                {medicalRecord.doctor &&
                                    <>
                                        <Tooltip target=".doctor-tooltip" />
                                        <div
                                            className="flex mt-2 align-items-baseline text-xl font-medium text-primary-900 doctor-tooltip"
                                            data-pr-tooltip='Provider name'
                                            data-pr-position='top'
                                            data-pr-at="left+60 top"
                                        >
                                            <FontAwesomeIcon icon={faUserDoctor} className="mr-1"/>
                                            {medicalRecord.doctor.user.firstName + ' ' + medicalRecord.doctor.user.lastName}
                                        </div>
                                    </>
                                }
                            </>
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