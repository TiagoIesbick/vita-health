import { useInterval } from 'primereact/hooks';
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ACCESS_MEDICAL_TOKEN_KEY, deleteCookie } from "../graphql/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHospitalUser } from '@fortawesome/free-solid-svg-icons';


const CountDown = ({ patient, setPatient, showMessage, patientDetail }) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const clock = useRef(null);

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

    return (
        <div className='flex flex-wrap gap-3 mb-4 text-xl font-semibold text-primary-900'>
            <span className='flex md:flex-1 gap-1'>
                <FontAwesomeIcon icon={faHospitalUser} />
                {patientDetail.firstName + ' ' + patientDetail.lastName}
            </span>
            <span className='flex md:flex-1 gap-1' ref={clock}>
                <i className="pi pi-clock text-xl font-semibold"></i>
                {`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
            </span>
        </div>
    );
};
export default CountDown;