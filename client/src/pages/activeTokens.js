import { useActiveDoctorTokens, useActivePatientTokens } from "../hooks/hooks";
import { useNavigate } from 'react-router';
import { Card } from "primereact/card";
import { DataView } from 'primereact/dataview';
import { useState } from "react";
import { useUser } from "../providers/userContext";
import { useLanguage } from "../providers/languageContext";
import { Link } from "react-router-dom";
import LoadingSkeleton from "../components/skeleton";
import ConfirmDeactivateToken from "../components/confirmDeactivateToken";
import DataViewHeader from "../components/dataViewHeader";
import TokenTemplate from "../components/tokenTemplate";
import { TokenProvider } from "../providers/tokenContext";
import './activeTokens.css';


const ActiveTokens = () => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
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
            showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    if ((user.userType === 'Patient' && (!activePatientTokens || activePatientTokens.length === 0)) ||
        (user.userType === 'Doctor' && (!activeDoctorTokens || activeDoctorTokens.length === 0))) {
        return (
            <Card
                title={translations?.activeTokens?.title}
                className="flex justify-content-center align-items-center card-min-height"
            >
                <p>{translations?.activeTokens?.noData?.firstP}</p>
                {user.userType === 'Patient' ?
                    <>
                        <p>{translations?.activeTokens?.noData?.secondP1st} <Link to="/generate-access-token" >{translations?.here}</Link> {translations?.activeTokens?.noData?.secondP2nd}</p>
                        <p>{translations?.activeTokens?.noData?.thirdP}</p>
                    </> :
                    <>
                        <p>{translations?.activeTokens?.noData?.firstPDoctorUser} <Link to="/insert-token" >{translations?.here}</Link>.</p>
                        <p>{translations?.activeTokens?.noData?.secondPDoctorUser}</p>
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
            <Card className="card-min-height" title={translations?.activeTokens?.title}>
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
