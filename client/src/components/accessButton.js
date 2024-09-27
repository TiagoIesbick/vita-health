import { Button } from "primereact/button";
import { useUser } from "../providers/userContext";
import { useSaveTokenAccess } from "../hooks/hooks";
import { useApolloClient } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { handleTokenAccess } from "../utils/utils";


const AccessButton = ({ token }) => {
    const navigate = useNavigate();
    const client = useApolloClient();
    const { setPatient, showMessage } = useUser();
    const { addTokenAccess, loadingTokenAccess, errorTokenAccess } = useSaveTokenAccess();

    const handleClick = () => {
        handleTokenAccess(token, client, addTokenAccess, setPatient, showMessage, navigate);
    };

    if (errorTokenAccess) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <Button onClick={handleClick} icon="pi pi-eye" rounded text loading={loadingTokenAccess} />
    );

};
export default AccessButton;