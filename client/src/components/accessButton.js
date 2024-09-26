import { Button } from "primereact/button";
import { ACCESS_MEDICAL_TOKEN_KEY, deleteCookie, getCredentials, storeToken } from "../graphql/auth";
import { useUser } from "../providers/userContext";
import { useSaveTokenAccess } from "../hooks/hooks";
import { useApolloClient } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { activeDoctorTokensQuery, medicalRecordsQuery } from "../graphql/queries";


const AccessButton = ({ token }) => {
    const navigate = useNavigate();
    const client = useApolloClient();
    const { setPatient, showMessage } = useUser();
    const { addTokenAccess, loadingTokenAccess, errorTokenAccess } = useSaveTokenAccess();

    const handleClick = async () => {
        storeToken(ACCESS_MEDICAL_TOKEN_KEY, token);
        const resTokenAccess = await addTokenAccess(token);
        if (resTokenAccess.accessError) {
            showMessage('error', 'Error', resTokenAccess.accessError);
            if (resTokenAccess.accessError === 'Missing authorization') {
                const cachedData = client.cache.readQuery({ query: activeDoctorTokensQuery });
                if (cachedData) {
                    client.refetchQueries({ include: ["ActiveDoctorTokens"] });
                };
            };
            setPatient(null);
            deleteCookie(ACCESS_MEDICAL_TOKEN_KEY);
        } else {
            const credentials = getCredentials(ACCESS_MEDICAL_TOKEN_KEY);
            setPatient(credentials);
            const cachedData = client.cache.readQuery({ query: medicalRecordsQuery });
            if (cachedData) {
                client.refetchQueries({ include: ["medicalRecords"] });
            };
            navigate("/medical-records-access");
            showMessage('success', 'Sucess', 'Permission Granted');
        };
    };

    return (
        <Button onClick={handleClick} icon="pi pi-eye" rounded text loading={loadingTokenAccess} />
    );

};
export default AccessButton;