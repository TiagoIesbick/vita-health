import { useMedicalRecords } from "../hooks/hooks";
import { Card } from "primereact/card";
import { Timeline } from 'primereact/timeline';
import { Button } from 'primereact/button';
import './medicalRecords.css';


const MedicalRecords = () => {
    const { medicalRecords, loading, error } = useMedicalRecords();

    const customizedMarker = (item) => {
        return (
            <span className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1" style={{ backgroundColor: 'var(--primary-500)' }}>
                <i className={'pi pi-check'}></i>
            </span>
        );
    };

    const customizedContent = (item) => {
        return (
            <Card title={item.recordType.recordName} subTitle={item.dateCreated}>
                <p>{item.recordData}</p>
                <Button label="Read more" className="p-button-text"></Button>
            </Card>
        );
    };

    if (loading) {
        return <div>Loading...</div>
    };
    if (error) {
        return <div>Data Unavailable</div>
    };
    return (
        <Card
            title="Medical Records"
            className="flex justify-content-center align-items-center card-min-height"
        >
            <Timeline value={medicalRecords} align="alternate" className="customized-timeline" marker={customizedMarker} content={customizedContent} />
        </Card>
    );
};
export default MedicalRecords;
