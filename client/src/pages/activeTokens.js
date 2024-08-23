import { useActiveDoctorTokens, useActivePatientTokens } from "../hooks/hooks";
import { Card } from "primereact/card";
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { useState } from "react";
import { useUser } from "../providers/userContext";
import CopyButton from "../components/copyButton";
import { localDateTime } from "../utils/utils";


const ActiveTokens = () => {
    const { user } = useUser();
    const { activePatientTokens, loadingActivePatientTokens, errorActivePatientTokens } = useActivePatientTokens();
    const { activeDoctorTokens, loadingActiveDoctorTokens, errorActiveDoctorTokens } = useActiveDoctorTokens();
    const [layout, setLayout] = useState('grid');

    const listItem = (token, index) => {
        let date = localDateTime(token.expirationDate, 'minus');
        return (
            <div className="col-12" key={token.tokenId}>
                <div className={classNames('flex flex-column gap-3', { 'border-top-1 surface-border': index !== 0 })}>
                    <div className={classNames('flex font-semibold mt-3 justify-content-center', { 'gap-3': user.userType === 'Doctor' })} >
                        {user.userType === 'Doctor' && <span className="flex gap-1"><i className="pi pi-user"></i>{token.patient.user.firstName + ' ' + token.patient.user.lastName}</span>}
                        <span className="flex gap-1"><i className="pi pi-hourglass"></i>{`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}</span>
                    </div>
                    <div className="flex align-items-center gap-3 mb-3 justify-content-between">
                        <span className="flex align-items-center gap-2">
                            <span className="xs:w-full"><CopyButton txt={token.token}/></span>
                            <span className="text-xs xs:text-center" style={{wordBreak:'break-word'}}>{token.token}</span>
                        </span>
                        { user.userType === 'Patient' &&
                            <span className="xs:w-full pr-4">
                                <Button text severity={'secondary'} className="gap-1 text-sm p-0">
                                    <i className="pi pi-eye"></i>
                                    {token.tokenAccess?.length || 0}
                                </Button>
                            </span>
                        }
                    </div>
                </div>
            </div>
        );
    };

    const gridItem = (token) => {
        let date = localDateTime(token.expirationDate, 'minus');

        return (
            <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" key={token.tokenId}>
                <div className="p-4 border-1 surface-border surface-card border-round">
                    <div className={classNames('flex flex-wrap align-items-center', { 'justify-content-end': user.userType === 'Patient', 'justify-content-between': user.userType === 'Doctor' })}>
                        {user.userType === 'Doctor' && <span className="text-sm">{token.patient.user.firstName + ' ' + token.patient.user.lastName}</span>}
                        <CopyButton txt={token.token} />
                    </div>
                    <div className="flex flex-column align-items-center py-2">
                        <p className="font-semibold text-xs text-center" style={{wordBreak: 'break-all'}}>{token.token}</p>
                    </div>
                    <div className={classNames('flex align-items-center', { 'justify-content-between': user.userType === 'Patient', 'justify-content-center': user.userType === 'Doctor' })}>
                        <div className='flex gap-1 text-sm'>
                            <i className="pi pi-hourglass"></i>
                            <span>{`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}</span>
                        </div>
                        {user.userType === 'Patient' &&
                            <Button text severity={'secondary'} className="gap-1 text-sm p-0">
                                <i className="pi pi-eye"></i>
                                {token.tokenAccess?.length || 0}
                            </Button>
                        }
                    </div>
                </div>
            </div>
        );
    }

    const itemTemplate = (token, layout, index) => {
        if (!token) {
            return;
        };

        if (layout === 'list') return listItem(token, index);
        else if (layout === 'grid') return gridItem(token);
    };

    const listTemplate = (tokens, layout) => {
        if (!tokens) {
            return;
        };
        return <div className="grid grid-nogutter">{tokens.map((token, index) => itemTemplate(token, layout, index))}</div>;
    };

    const header = () => {
        return (
            <div className="flex justify-content-end">
                <DataViewLayoutOptions layout={layout} onChange={(e) => setLayout(e.value)} />
            </div>
        );
    };

    if ((user.userType === 'Patient' && loadingActivePatientTokens) ||
        (user.userType === 'Doctor' && loadingActiveDoctorTokens)) {
        return <div>Loading...</div>
    };
    if ((user.userType === 'Patient' && errorActivePatientTokens) ||
        (user.userType === 'Doctor' && errorActiveDoctorTokens)) {
        return <div>Data Unavailable</div>
    };

    return (
        <Card style={{minHeight: 'calc(100vh - 128px)'}}>
            <DataView
                value={user.userType === 'Patient' ? activePatientTokens: activeDoctorTokens}
                listTemplate={listTemplate}
                layout={layout}
                header={header()}
            />
        </Card>
    );
};
export default ActiveTokens;
