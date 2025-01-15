import { Button } from "primereact/button";
import { useUser } from "../providers/userContext";
import { useSaveTokenAccess } from "../hooks/hooks";
import { useApolloClient } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../providers/languageContext";
import { handleTokenAccess } from "../utils/utils";


const AccessButton = ({ token }) => {
    const navigate = useNavigate();
    const client = useApolloClient();
    const { translations } = useLanguage();
    const { setPatient, showMessage } = useUser();
    const { addTokenAccess, loadingTokenAccess, errorTokenAccess } = useSaveTokenAccess();

    const handleClick = () => {
        handleTokenAccess(token, client, addTokenAccess, setPatient, showMessage, navigate, translations);
    };

    if (errorTokenAccess) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    return (
        <Button onClick={handleClick} icon="pi pi-eye" rounded text loading={loadingTokenAccess} />
    );

};
export default AccessButton;