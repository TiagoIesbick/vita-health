import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useDeactivateToken } from '../hooks/hooks';
import { useUser } from "../providers/userContext";
import { useNavigate } from "react-router-dom";


const ConfirmDeactivateToken = ({visible, setVisible, tokenId}) => {
    const navigate = useNavigate();
    const { showMessage } = useUser();
    const { inactivateToken, loadingDeactivateToken, errorDeactivateToken } = useDeactivateToken();

    const handleDeactivate = async () => {
        console.log(tokenId);
        const res = await inactivateToken(tokenId);
        if (res.deactivateTokenError) {
            showMessage('error', 'Error', res.deactivateTokenError);
        } else {
            showMessage('success', 'Success', res.deactivateTokenConfirmation);
            setVisible(false);
        };
    };

    if (errorDeactivateToken) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
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
                            Deactivation Confirmation
                        </span>
                        <p className="mb-0" >
                            Do you want to deactivate this token?
                        </p>
                        <div className="flex align-items-center gap-2 mt-4" >
                            <Button
                                label="Deactivate"
                                onClick={handleDeactivate}
                                severity={'danger'}
                                className="w-8rem"
                                loading={loadingDeactivateToken}
                                disabled={loadingDeactivateToken}
                            ></Button>
                            <Button
                                label="Cancel"
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