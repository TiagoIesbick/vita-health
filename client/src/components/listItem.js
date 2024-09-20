import { localDateTime } from "../utils/utils";
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import CopyButton from "../components/copyButton";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHospitalUser, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';


const ListItem = ({ user, token, index, setVisible, setTokenId }) => {
    let date = localDateTime(token.expirationDate, 'minus');

    const handleClick = () => {
        setTokenId(token.tokenId);
        setVisible(true);
    };

    return (
        <div className="col-12" key={token.tokenId}>
            <div className={classNames('flex flex-column gap-3', { 'border-top-1 surface-border': index !== 0 })}>
                <div className='flex font-semibold mt-3 justify-content-center gap-3 align-items-center' >
                    {user.userType === 'Doctor' && <span className="flex gap-1"><FontAwesomeIcon icon={faHospitalUser} />{token.patient.user.firstName + ' ' + token.patient.user.lastName}</span>}
                    <span className="flex gap-1"><FontAwesomeIcon icon={faHourglassHalf} />{`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}</span>
                    {user.userType === 'Patient' &&
                        <span className="xs:w-full pr-4">
                            <Button text className="gap-1 p-0">
                                <i className="pi pi-eye"></i>
                                {token.tokenAccess?.length || 0}
                            </Button>
                        </span>
                    }
                </div>
                <div className="flex align-items-center gap-3 mb-3 justify-content-between">
                    <span className="flex align-items-center gap-2">
                        <span className="xs:w-full"><CopyButton txt={token.token}/></span>
                        <span className="text-xs xs:text-center" style={{wordBreak:'break-word'}}>{token.token}</span>
                    </span>
                    { user.userType === 'Patient' &&
                        <span className="xs:w-full pr-4">
                            <Button onClick={handleClick} text severity={'danger'} className="p-0">
                                <i className="pi pi-eye-slash"></i>
                            </Button>
                        </span>
                    }
                </div>
            </div>
        </div>
    );
};
export default ListItem;