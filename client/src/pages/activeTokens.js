import { useActiveDoctorTokens, useActivePatientTokens } from "../hooks/hooks";
import { useNavigate } from 'react-router';
import { Card } from "primereact/card";
import { DataView } from 'primereact/dataview';
import { useState } from "react";
import { useUser } from "../providers/userContext";
import { Link } from "react-router-dom";
import LoadingSkeleton from "../components/skeleton";
import ConfirmDeactivateToken from "../components/confirmDeactivateToken";
import DataViewHeader from "../components/dataViewHeader";
import TokenTemplate from "../components/tokenTemplate";
import { TokenProvider } from "../providers/tokenContext";
import './activeTokens.css';


const ActiveTokens = () => {
    const navigate = useNavigate();
    const { user, showMessage } = useUser();
    const { activePatientTokens, loadingActivePatientTokens, errorActivePatientTokens } = useActivePatientTokens();
    const { activeDoctorTokens, loadingActiveDoctorTokens, errorActiveDoctorTokens } = useActiveDoctorTokens();
    const [layout, setLayout] = useState('grid');


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
                {tokens.map((token, index) => <TokenTemplate user={user} token={token} index={index} layout={layout} key={token.tokenId} />)}
            </div>
        );
    };

    return (
        <TokenProvider>
            <Card className="card-min-height" title="Active Tokens">
                <DataView
                    value={user.userType === 'Patient' ? activePatientTokens: activeDoctorTokens}
                    listTemplate={listTemplate}
                    layout={layout}
                    header={<DataViewHeader layout={layout} setLayout={setLayout} />}
                />
                <ConfirmDeactivateToken />
            </Card>
        </TokenProvider>
    );
};
export default ActiveTokens;
