import { useActiveDoctorTokens, useActivePatientTokens } from "../hooks/hooks";
import { useApolloClient } from "@apollo/client";
import { useNavigate } from 'react-router';
import { Card } from "primereact/card";
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { useState, useEffect } from "react";
import { useUser } from "../providers/userContext";
import { Link } from "react-router-dom";
import { localDateTime } from "../utils/utils";
import CopyButton from "../components/copyButton";
import LoadingSkeleton from "../components/skeleton";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { activeDoctorTokensQuery, activePatientTokensQuery } from "../graphql/queries";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHospitalUser, faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import './activeTokens.css';


const ActiveTokens = () => {
    const client = useApolloClient();
    const navigate = useNavigate();
    const { user, showMessage } = useUser();
    const { activePatientTokens, loadingActivePatientTokens, errorActivePatientTokens } = useActivePatientTokens();
    const { activeDoctorTokens, loadingActiveDoctorTokens, errorActiveDoctorTokens } = useActiveDoctorTokens();
    const [layout, setLayout] = useState('grid');

    const confirm = () => {
        confirmDialog({
            message: 'Do you want to deactivate this token?',
            header: 'Deactivation Confirmation',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            // accept,
            // reject
        });
    };

    useEffect(() => {
        const updateCache = (query, field) => {
            const cachedData = client.readQuery({ query });
            if (cachedData && cachedData[field]) {
                const updatedTokens = cachedData[field].map((token) => {
                    const isExpired = localDateTime(token.expirationDate, 'minus') < new Date();
                    return isExpired ? null : token;
                }).filter(Boolean);
                client.writeQuery({
                    query,
                    data: { [field]: updatedTokens },
                });
            };
        };
        const intervalId = setInterval(() => {
            if (user.userType === 'Patient') {
                updateCache(activePatientTokensQuery, 'activePatientTokens');
            } else if (user.userType === 'Doctor') {
                updateCache(activeDoctorTokensQuery, 'activeDoctorTokens');
            };
        }, 1000);
        return () => clearInterval(intervalId);
    }, [client, user.userType]);

    if ((user.userType === 'Patient' && loadingActivePatientTokens) ||
        (user.userType === 'Doctor' && loadingActiveDoctorTokens)) {
        return <LoadingSkeleton />
    };

    if ((user.userType === 'Patient' && errorActivePatientTokens) ||
        (user.userType === 'Doctor' && errorActiveDoctorTokens)) {
            navigate('/');
            showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    if ((user.userType === 'Patient' && (!activePatientTokens || activePatientTokens.length === 0)) ||
        (user.userType === 'Doctor' && (!activeDoctorTokens || activeDoctorTokens.length === 0))) {
        return (
            <Card
                title="Active Tokens"
                className="flex justify-content-center align-items-center card-min-height"
            >
                <p>You have no active tokens.</p>
                {user.userType === 'Patient' ?
                    <>
                        <p>Generate a token <Link to="/generate-access-token" >here</Link> to share with your health professional.</p>
                        <p>This will grant them temporary access to your medical history and allow them to add new data.</p>
                    </> :
                    <>
                        <p>Enter a token shared by your patient <Link to="/insert-token" >here</Link>.</p>
                        <p>This will grant you temporary access to their medical history and allow you to add new data.</p>
                    </>
                }
            </Card>
        );
    };

    const listItem = (token, index) => {
        let date = localDateTime(token.expirationDate, 'minus');
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
                                <Button onClick={confirm} text severity={'danger'} className="p-0">
                                    <i className="pi pi-eye-slash"></i>
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

    return (
        <Card className="card-min-height">
            <DataView
                value={user.userType === 'Patient' ? activePatientTokens: activeDoctorTokens}
                listTemplate={listTemplate}
                layout={layout}
                header={header()}
            />
            <ConfirmDialog />
        </Card>
    );
};
export default ActiveTokens;
