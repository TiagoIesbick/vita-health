import { Divider } from 'primereact/divider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXRay, faMagnet, faHeartPulse, faVials, faTowerBroadcast } from '@fortawesome/free-solid-svg-icons';
import { ACCESS_MEDICAL_TOKEN_KEY, deleteCookie, getCredentials, storeToken } from "../graphql/auth";
import { activeDoctorTokensQuery } from "../graphql/queries";
import HealthDataContent from '../components/healthDataContent';


export const TINYMCE_API_KEY = process.env.REACT_APP_TINYMCE_API_KEY;


export const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};


export const supportedFileFormats = ["image/jpeg", "image/png", "image/svg+xml", "image/webp", "application/pdf"];


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


export const limit = 10;


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
    };

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


export const customizedContent = (item) => <HealthDataContent item={item} />;


export const handleTokenAccess = async (token, client, addTokenAccess, setPatient, showMessage, navigate, resetForm) => {
    storeToken(ACCESS_MEDICAL_TOKEN_KEY, token);
    const resTokenAccess = await addTokenAccess(token);

    if (resTokenAccess.accessError) {
        showMessage('error', 'Error', resTokenAccess.accessError);
        if (resTokenAccess.accessError === 'Missing authorization') {
            const cachedData = client.cache.readQuery({ query: activeDoctorTokensQuery });
            if (cachedData) {
                client.refetchQueries({ include: ["ActiveDoctorTokens"] });
            }
        }
        setPatient(null);
        deleteCookie(ACCESS_MEDICAL_TOKEN_KEY);
    } else {
        const credentials = getCredentials(ACCESS_MEDICAL_TOKEN_KEY);
        setPatient(credentials);
        client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'medicalRecords' });
        client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'aiConversation' });
        client.cache.gc();
        showMessage('success', 'Success', 'Permission Granted');
        navigate("/medical-records-access");
        if (resetForm) resetForm();
    }
};
