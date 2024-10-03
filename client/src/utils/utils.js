import { Divider } from 'primereact/divider';
import { Card } from "primereact/card";
import { Button } from 'primereact/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXRay, faMagnet, faHeartPulse, faVials, faTowerBroadcast } from '@fortawesome/free-solid-svg-icons';
import { ACCESS_MEDICAL_TOKEN_KEY, deleteCookie, getCredentials, storeToken } from "../graphql/auth";
import { activeDoctorTokensQuery, medicalRecordsQuery } from "../graphql/queries";
import { Link } from "react-router-dom";
import { BASE_URL_SERVER } from '../graphql/apolloConfig';


export const TINYMCE_API_KEY = process.env.REACT_APP_TINYMCE_API_KEY;


export const stripHtmlTags = (html) => html.replace(/<\/?[^>]+>/gi, '');


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
    console.log(item);
    return (
        <Card title={item.recordType.recordName} subTitle={`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}>
            <div dangerouslySetInnerHTML={{__html: item.recordData}} />
            <span>Files</span>
            {item.files.length > 0 && <Link to={`${BASE_URL_SERVER}${item.files[0].url}`} target='_blank'>{item.files[0].fileName}</Link>}
            <Button label="Read more" text></Button>
        </Card>
    );
};


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
        const cachedData = client.cache.readQuery({ query: medicalRecordsQuery });
        if (cachedData) {
            client.refetchQueries({ include: ["medicalRecords"] });
        }
        showMessage('success', 'Success', 'Permission Granted');
        navigate("/medical-records-access");
        if (resetForm) resetForm();
    }
};
