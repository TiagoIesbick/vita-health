import { localDateTime } from "../utils/utils";
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useTokenContext } from '../providers/tokenContext';
import CopyButton from "../components/copyButton";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHospitalUser, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';


const ListItem = ({ user, token, index }) => {
    const { setVisible, setTokenId } = useTokenContext();
    const location = useLocation();
    const justifyRow = useRef(null);
    const [displayButtons, setDisplayButtons] = useState(location.pathname !== '/inactive-tokens');


    let date = localDateTime(token.expirationDate, 'minus');

    useEffect(() => {
        if (location.pathname === '/inactive-tokens' && user.userType === 'Patient') {
            setDisplayButtons(false);
            justifyRow.current.style.justifyContent = 'center';
        } else if (location.pathname !== '/inactive-tokens' && user.userType === 'Patient') {
            setDisplayButtons(true);
            justifyRow.current.style.justifyContent = 'space-between';
        } else if (location.pathname !== '/inactive-tokens' && user.userType === 'Doctor' ) {
            justifyRow.current.style.justifyContent = 'center';
        };
    },[location, user.userType])

    const handleClick = () => {
        setTokenId(token.tokenId);
        setVisible(true);
    };

    return (
        <div className="col-12" key={token.tokenId}>
            <div className={classNames('flex flex-column gap-1', { 'border-top-1 surface-border': index !== 0 })}>
                <div className='flex font-semibold mt-2 justify-content-center gap-3 align-items-center h-3rem' >
                    {user.userType === 'Doctor' && <span className="flex gap-1"><FontAwesomeIcon icon={faHospitalUser} />{token.patient.user.firstName + ' ' + token.patient.user.lastName}</span>}
                    <span className="flex gap-1"><FontAwesomeIcon icon={faHourglassHalf} />{`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}</span>
                    {user.userType === 'Patient' &&
                        <Button
                            rounded
                            text
                        >
                            <i className="pi pi-eye p-overlay-badge">
                                <Badge className="bg-primary-100" value={token.tokenAccess?.length || 0}></Badge>
                            </i>
                        </Button>
                    }
                </div>
                <div ref={justifyRow} className="flex align-items-center mb-3">
                    {displayButtons && <span className="xs:w-full"><CopyButton txt={token.token}/></span>}
                    <span className="text-xs text-center" style={{wordBreak:'break-all'}}>{token.token}</span>
                    { user.userType === 'Patient' && displayButtons &&
                        <span className="xs:w-full">
                            <Button onClick={handleClick} icon="pi pi-eye-slash" rounded text severity={'danger'}>
                            </Button>
                        </span>
                    }
                </div>
            </div>
        </div>
    );
};
export default ListItem;