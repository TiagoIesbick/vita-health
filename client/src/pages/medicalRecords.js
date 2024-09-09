import { useMedicalRecords } from "../hooks/hooks";
import { Card } from "primereact/card";
import { Timeline } from 'primereact/timeline';
import { Button } from 'primereact/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXRay, faMagnet, faHeartPulse, faVials, faTowerBroadcast } from '@fortawesome/free-solid-svg-icons';
import { useUser } from "../providers/userContext";
import { useNavigate } from 'react-router';
import { Link } from "react-router-dom";
import { localDateTime } from "../utils/utils";
import LoadingSkeleton from "../components/skeleton";
import './medicalRecords.css';


const MedicalRecords = () => {
    const navigate = useNavigate();
    const { showMessage } = useUser();
    const { medicalRecords, loading, error } = useMedicalRecords();

    const customizedMarker = (item) => {
        const recordStyle = {
            'Blood Test': {icon: <FontAwesomeIcon icon={faVials} />, color: '--red-300'},
            'MRI Scan': {icon: <FontAwesomeIcon icon={faMagnet} />, color: '--bluegray-500'},
            'X-Ray': {icon: <FontAwesomeIcon icon={faXRay} />, color: '--primary-900'},
            'Ultrasound': {icon: <FontAwesomeIcon icon={faTowerBroadcast} />, color: '--indigo-500'},
            'ECG': {icon: <FontAwesomeIcon icon={faHeartPulse} />, color: '--pink-500'}
        }
        return (
            <span
                className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1"
                style={
                    { backgroundColor: recordStyle[item.recordType.recordName] ? `var(${recordStyle[item.recordType.recordName].color})` : 'var(--primary-500)' }
                }
            >
                { recordStyle[item.recordType.recordName] ? recordStyle[item.recordType.recordName].icon : <i className={'pi pi-check'}></i> }
            </span>
        );
    };

    const customizedContent = (item) => {
        let date = localDateTime(item.dateCreated, 'minus');
        return (
            <Card title={item.recordType.recordName} subTitle={`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}>
                <div dangerouslySetInnerHTML={{__html: item.recordData}} />
                <Button label="Read more" className="p-button-text"></Button>
            </Card>
        );
    };

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
