import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useDeactivateToken } from '../hooks/hooks';
import { useUser } from "../providers/userContext";
import { useLanguage } from "../providers/languageContext";
import { useNavigate } from "react-router-dom";
import { useTokenContext } from '../providers/tokenContext';


const ConfirmDeactivateToken = () => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { visible, setVisible, tokenId } = useTokenContext();
    const { showMessage } = useUser();
    const { inactivateToken, loadingDeactivateToken, errorDeactivateToken } = useDeactivateToken();

    const handleDeactivate = async () => {
        const res = await inactivateToken(tokenId);
        if (res.deactivateTokenError) {
            showMessage('error', translations?.error?.title, translations?.error?.[res.deactivateTokenError]);
        } else {
            showMessage('success', translations?.success?.title, translations?.success?.[res.deactivateTokenConfirmation]);
            setVisible(false);
        };
    };

    if (errorDeactivateToken) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    return (
            <Dialog
                visible={visible}
                onHide={() => {if (!visible) return; setVisible(false); }}
                content={({ hide }) => (
                    <div className="flex flex-column align-items-center p-5 surface-overlay border-round">
                        <div className="border-circle bg-red-400 text-white inline-flex justify-content-center align-items-center h-6rem w-6rem -mt-8">
                            <i className="pi pi-question text-5xl"></i>
                        </div>
                        <span className="font-bold text-2xl block mb-2 mt-4" >
                            {translations?.confirmDeactivate?.title}
                        </span>
                        <p className="mb-0" >
                            {translations?.confirmDeactivate?.question}
                        </p>
                        <div className="flex align-items-center gap-2 mt-4" >
                            <Button
                                label={translations?.confirmDeactivate?.deactivate}
                                onClick={handleDeactivate}
                                severity={'danger'}
                                className="w-8rem"
                                loading={loadingDeactivateToken}
                                disabled={loadingDeactivateToken}
                            ></Button>
                            <Button
                                label={translations?.cancel}
                                outlined
                                onClick={(event) => {
                                    hide(event);
                                }}
                                severity={'danger'}
                                className="w-8rem"
                                loading={loadingDeactivateToken}
                                disabled={loadingDeactivateToken}
                            ></Button>
                        </div>
                    </div>
                )}
            />
    );

};
export default ConfirmDeactivateToken;