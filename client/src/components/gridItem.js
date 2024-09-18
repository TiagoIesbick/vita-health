import { localDateTime } from "../utils/utils";
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import CopyButton from "../components/copyButton";


const GridItem = ({ user, token, confirm }) => {
    let date = localDateTime(token.expirationDate, 'minus');

    return (
        <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" key={token.tokenId}>
            <div className="p-4 border-1 surface-border surface-card border-round">
                <div className='flex flex-wrap align-items-center justify-content-between'>
                    {user.userType === 'Doctor'
                        ? <span className="text-sm">{token.patient.user.firstName + ' ' + token.patient.user.lastName}</span>
                        : <div className='flex gap-1 text-sm'>
                            <i className="pi pi-hourglass"></i>
                            <span>{`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}</span>
                          </div>
                    }
                    <CopyButton txt={token.token} />
                </div>
                <div className="flex flex-column align-items-center py-2">
                    <p className="font-semibold text-xs text-center" style={{wordBreak: 'break-all'}}>{token.token}</p>
                </div>
                <div className={classNames('flex align-items-center', { 'justify-content-between': user.userType === 'Patient', 'justify-content-center': user.userType === 'Doctor' })}>
                    {user.userType === 'Doctor'
                        ? <div className='flex gap-1 text-sm'>
                            <i className="pi pi-hourglass"></i>
                            <span>{`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}</span>
                          </div>
                        : <>
                            <Button onClick={confirm} text severity={'danger'} className="gap-1 text-sm p-0">
                                <i className="pi pi-eye-slash"></i>
                            </Button>
                            <Button text className="gap-1 text-sm p-0">
                                <i className="pi pi-eye"></i>
                                {token.tokenAccess?.length || 0}
                            </Button>
                          </>
                    }
                </div>
            </div>
        </div>
    );
};
export default GridItem;