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
import { useLanguage } from "../providers/languageContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import CopyButton from "../components/copyButton";


const GenerateAccessToken = () => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
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
                showMessage('error', translations?.error?.title, resToken.tokenError);
            } else {
                resetForm();
                setToken(resToken.token.token);
                setVisible(true);
            };
        },
        validationSchema: Yup.object({
            tokenExpirationDateTime: Yup.date().required(translations?.required)
                .min(toDay, translations?.generateToken?.expTimeFirstValidation)
                .max(toDayPlus90, translations?.generateToken?.expTimeSecondValidation)
        }),
    });

    if (error) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    return (
        <Card
            title={translations?.generateToken?.title}
            className="flex justify-content-center align-items-center card-min-height"
        >
            <form className="flex flex-column gap-4" onSubmit={formik.handleSubmit}>
                <FloatLabel>
                    <Calendar
                        className="w-full"
                        inputId="token-expiration-date-time"
                        dateFormat={translations?.generateToken?.dateFormat}
                        minDate={toDay}
                        maxDate={toDayPlus90}
                        showIcon
                        showTime
                        hourFormat="24"
                        {...formik.getFieldProps("tokenExpirationDateTime")}
                    />
                    <label htmlFor="token-expiration-date-time">{translations?.generateToken?.expTime}</label>
                    {formik.touched.tokenExpirationDateTime && formik.errors.tokenExpirationDateTime &&<div className="text-red-500 text-xs">{formik.errors.tokenExpirationDateTime}</div>}
                </FloatLabel>
                <Button type="submit" label={translations?.confirm} disabled={!formik.isValid || loading} loading={loading} />
            </form>
            <Dialog
                visible={visible}
                onHide={() => {if (!visible) return; setVisible(false); }}
                style={{ width: '30vw' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                content={({ hide }) => (
                    <div className="flex flex-column align-items-center px-5 pt-5 pb-3 surface-overlay border-round">
                        <motion.div
                            animate={{
                                scale: [1, 2, 2, 1, 1],
                                rotate: [0, 0, 270, 270, 0],
                            }}
                            className="border-circle bg-primary inline-flex justify-content-center align-items-center h-6rem w-6rem -mt-8"
                        >
                            <i className="pi pi-ticket text-5xl"></i>
                        </motion.div>
                        <Button icon="pi pi-times" onClick={(e) => {hide(e); setToken('');}} rounded text severity="secondary" aria-label="Close" className="absolute top-0 right-0 focus:border-none focus:shadow-none"/>
                        <span className="font-bold text-2xl block mt-3 mb-2" >
                            Token
                        </span>
                        <p style={{ wordBreak: 'break-all' }} className="my-1 text-center">{token}</p>
                        <CopyButton txt={token} />
                    </div>
                )}
            ></Dialog>
        </Card>
    );
};
export default GenerateAccessToken;
