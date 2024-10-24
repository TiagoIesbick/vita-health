import { useInterval } from 'primereact/hooks';
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ACCESS_MEDICAL_TOKEN_KEY, deleteCookie } from "../graphql/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHospitalUser, faNotesMedical } from '@fortawesome/free-solid-svg-icons';
import { Button } from "primereact/button";
import { Tooltip } from 'primereact/tooltip';
import './countdown.css';


const CountDown = ({ patient, setPatient, showMessage, patientDetail }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const clock = useRef(null);
    const addButton = useRef(null);

    useInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const difference = patient.exp - now;
        if (difference > 0) {
            const days = Math.floor(difference / (60 * 60 * 24));
            const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
            const minutes = Math.floor((difference % (60 * 60)) / 60);
            const seconds = Math.floor(difference % 60);
            setTimeLeft({ days, hours, minutes, seconds });
            if (difference < 5 * 60) clock.current.style.color = 'red';
        } else {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            setPatient(null);
            deleteCookie(ACCESS_MEDICAL_TOKEN_KEY);
            navigate('/');
            showMessage('error', 'Expired', 'Access permission has expired.', true);
        };
    }, 1000);

    useEffect(() => {
        if (location.pathname === '/insert-medical-record') {
            addButton.current.style.display = 'none';
        } else {
            addButton.current.style.display = 'flex';
        };
    },[location]);

    return (
        <div className='flex flex-wrap gap-2 mb-4 text-xl font-semibold text-primary-900 align-items-center'>
            <Tooltip target=".patient-tooltip" />
            <span className='flex sm:flex-1 gap-1 min-w-max patient-tooltip'
                data-pr-tooltip='Patient name'
                data-pr-position='top'
                data-pr-at="left+60 top"
            >
                <FontAwesomeIcon icon={faHospitalUser} />
                {patientDetail?.firstName + ' ' + patientDetail?.lastName}
            </span>
            <Tooltip target=".expiration-tooltip" />
            <span className='flex sm:flex-1 gap-1 countdown-width expiration-tooltip'
                ref={clock}
                data-pr-tooltip='Expiration timer'
                data-pr-position='top'
                data-pr-at="left+60 top"
            >
                <i className="pi pi-clock text-xl font-semibold"></i>
                {`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
            </span>
            <Button ref={addButton} onClick={() => navigate("/insert-medical-record")}><FontAwesomeIcon className="pr-1" icon={faNotesMedical} /> Add Health Data</Button>
        </div>
    );
};
export default CountDown;