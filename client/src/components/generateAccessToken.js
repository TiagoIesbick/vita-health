import { useFormik } from "formik";
import * as Yup from "yup";
import { toDay, toDayPlus90 } from "../utils/utils";
import { FloatLabel } from "primereact/floatlabel";
import { Calendar } from "primereact/calendar";
import { Card } from 'primereact/card';
import { Button } from "primereact/button";
import { Dialog } from 'primereact/dialog';
import { useGenerateToken } from "../hooks/hooks";
import { useUser } from "../providers/userContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


const GenerateAccessToken = () => {
    const navigate = useNavigate();
    const { showMessage } = useUser();
    const { addToken, loading, error } = useGenerateToken();
    const [visible, setVisible] = useState(false);
    const [token, setToken] = useState('');
    const formik = useFormik({
        initialValues: {
            tokenExpirationDateTime: new Date()
        },
        onSubmit: async (values, { resetForm }) => {
            const resToken = await addToken(values.tokenExpirationDateTime);
            if (resToken.tokenError){
                showMessage('error', 'Error', resToken.tokenError);
            } else {
                resetForm();
                setToken(resToken.token.token);
                setVisible(true);
            };
        },
        validationSchema: Yup.object({
            tokenExpirationDateTime: Yup.date().required('Required')
                .min(toDay, 'The date cannot be in the past')
                .max(toDayPlus90, 'Maximum 90 days')
        }),
    });
    if (error) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <Card
            title="Generate Token"
            className="flex justify-content-center align-items-center"
            style={{minHeight: 'calc(100vh - 128px)'}}
        >
            <form className="flex flex-column gap-4" onSubmit={formik.handleSubmit}>
                <FloatLabel>
                    <Calendar
                        className="w-full"
                        inputId="token-expiration-date-time"
                        dateFormat="yy-mm-dd"
                        minDate={toDay}
                        maxDate={toDayPlus90}
                        showIcon
                        showTime
                        hourFormat="24"
                        {...formik.getFieldProps("tokenExpirationDateTime")}
                    />
                    <label htmlFor="token-expiration-date-time">Expiration Time</label>
                    {formik.touched.tokenExpirationDateTime && formik.errors.tokenExpirationDateTime &&<div className="text-red-500 text-xs">{formik.errors.tokenExpirationDateTime}</div>}
                </FloatLabel>
                <Button type="submit" label="Confirm" disabled={!formik.isValid || loading} loading={loading} />
            </form>
            <Dialog
                header="Token"
                visible={visible}
                style={{ width: '50vw' }}
                onHide={() => {if (!visible) return; setVisible(false); setToken('');}}
            >
                <p style={{ wordBreak: 'break-word' }} className="m-0">{token}</p>
            </Dialog>
        </Card>
    );
};
export default GenerateAccessToken;