import { localDateTime } from "../utils/utils";
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTokenContext } from '../providers/tokenContext';
import CopyButton from "../components/copyButton";


const GridItem = ({ user, token }) => {
    const { setVisible, setTokenId } = useTokenContext();
    const location = useLocation();
    const deactivateButton = useRef(null);
    const [copyButton, setCopyButton] = useState(location.pathname !== '/inactive-tokens');

    let date = localDateTime(token.expirationDate, 'minus');

    useEffect(() => {
        if (location.pathname === '/inactive-tokens' && user.userType === 'Patient') {
            deactivateButton.current.style.display = 'none';
            deactivateButton.current.parentNode.classList.remove('justify-content-between');
            deactivateButton.current.parentNode.classList.add('justify-content-end');
            setCopyButton(false);
        } else if (location.pathname !== '/inactive-tokens' && user.userType === 'Patient') {
            deactivateButton.current.style.display = 'inherit';
            deactivateButton.current.parentNode.classList.add('justify-content-between');
            setCopyButton(true);
        }
    },[location, user.userType])

    const handleClick = () => {
        setTokenId(token.tokenId);
        setVisible(true);
    };

    return (
        <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" key={token.tokenId}>
            <div className="p-3 border-1 surface-border surface-card border-round min-h-full flex flex-column justify-content-between">
                <div className='flex flex-wrap align-items-center justify-content-between h-3rem'>
                    {user.userType === 'Doctor'
                        ? <span className="text-sm">{token.patient.user.firstName + ' ' + token.patient.user.lastName}</span>
                        : <div className='flex gap-1 text-sm'>
                            <i className="pi pi-hourglass"></i>
                            <span>{`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}</span>
                          </div>
                    }
                    {copyButton && <CopyButton txt={token.token} />}
                </div>
                <div className="flex flex-column align-items-center">
                    <p className="font-semibold text-xs text-center" style={{wordBreak: 'break-all'}}>{token.token}</p>
                </div>
                <div className={classNames('flex align-items-center h-3rem', { 'justify-content-between': user.userType === 'Patient', 'justify-content-center': user.userType === 'Doctor' })}>
                    {user.userType === 'Doctor'
                        ? <div className='flex gap-1 text-sm'>
                            <i className="pi pi-hourglass"></i>
                            <span>{`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}</span>
                          </div>
                        : <>
                            <Button
                                ref={deactivateButton}
                                onClick={handleClick}
                                rounded
                                text
                                icon="pi pi-eye-slash"
                                severity={'danger'}
                            >
                            </Button>
                            <Button
                                rounded
                                text
                            >
                                <i className="pi pi-eye p-overlay-badge">
                                    <Badge className="bg-primary-100" value={token.tokenAccess?.length || 0}></Badge>
                                </i>
                            </Button>
                          </>
                    }
                </div>
            </div>
        </div>
    );
};
export default GridItem;