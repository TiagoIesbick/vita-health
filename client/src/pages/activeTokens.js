import { useActiveDoctorTokens, useActivePatientTokens } from "../hooks/hooks";
import { useApolloClient } from "@apollo/client";
import { useNavigate } from 'react-router';
import { Card } from "primereact/card";
import { DataView } from 'primereact/dataview';
import { useState, useEffect } from "react";
import { useUser } from "../providers/userContext";
import { Link } from "react-router-dom";
import { localDateTime } from "../utils/utils";
import LoadingSkeleton from "../components/skeleton";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { activeDoctorTokensQuery, activePatientTokensQuery } from "../graphql/queries";
import './activeTokens.css';
import DataViewHeader from "../components/dataViewHeader";
import TokenTemplate from "../components/tokenTemplate";


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

    const listTemplate = (tokens, layout) => {
        if (!tokens) {
            return;
        };
        return (
            <div className="grid grid-nogutter">
                {tokens.map((token, index) => <TokenTemplate user={user} token={token} index={index} confirm={confirm} layout={layout} key={token.tokenId}/>)}
            </div>
        );
    };

    return (
        <Card className="card-min-height">
            <DataView
                value={user.userType === 'Patient' ? activePatientTokens: activeDoctorTokens}
                listTemplate={listTemplate}
                layout={layout}
                header={<DataViewHeader layout={layout} setLayout={setLayout} />}
            />
            <ConfirmDialog />
        </Card>
    );
};
export default ActiveTokens;
