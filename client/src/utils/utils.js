import { Divider } from 'primereact/divider';
import { Card } from "primereact/card";
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXRay, faMagnet, faHeartPulse, faVials, faTowerBroadcast } from '@fortawesome/free-solid-svg-icons';


export const passwordHeader = <div className="font-bold mb-3">Pick a password</div>;


export const passwordFooter = (
    <>
        <Divider />
        <p className="mt-2">Rules</p>
        <ul className="pl-2 ml-2 mt-0 line-height-3">
            <li>At least one lowercase</li>
            <li>At least one uppercase</li>
            <li>At least one numeric</li>
            <li>Minimum 8 characters</li>
        </ul>
    </>
);


export const toDay = new Date();


export const toDayPlus90 = new Date( Date.now() + 90 * 24 * 60 * 60 * 1000);


export const localDateTime = (date, operation) => {
    const timeZoneOffset = new Date().getTimezoneOffset() / 60;
    let localDate = new Date(date);
    if (operation === 'minus') return new Date(localDate.setHours(localDate.getHours() - timeZoneOffset));
    return new Date(localDate.setHours(localDate.getHours() + timeZoneOffset));
};


export const customizedMarker = (item) => {
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


export const customizedContent = (item) => {
    let date = localDateTime(item.dateCreated, 'minus');
    return (
        <Card title={item.recordType.recordName} subTitle={`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}>
            <div dangerouslySetInnerHTML={{__html: item.recordData}} />
            <Button label="Read more" text></Button>
        </Card>
    );
};


export const confirmDeactivateToken = (accept) => {
    confirmDialog({
        message: 'Do you want to deactivate this token?',
        header: 'Deactivation Confirmation',
        icon: 'pi pi-exclamation-triangle',
        defaultFocus: 'reject',
        acceptClassName: 'p-button-danger',
        accept,
        // reject
    });
};
