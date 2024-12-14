import { useFormik } from "formik";
import * as Yup from "yup";
import { FloatLabel } from "primereact/floatlabel";
import { Card } from 'primereact/card';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from "primereact/button";
import { useUser } from "../providers/userContext";
import { useLanguage } from "../providers/languageContext";
import { useNavigate } from "react-router-dom";
import { useSaveTokenAccess } from "../hooks/hooks";
import { useApolloClient } from "@apollo/client";
import { handleTokenAccess } from "../utils/utils";


const InsertToken = () => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const client = useApolloClient();
    const { setPatient, showMessage } = useUser();
    const { addTokenAccess, loadingTokenAccess, errorTokenAccess } = useSaveTokenAccess();
    const formik = useFormik({
        initialValues: {
            token: ''
        },
        onSubmit: (values, { resetForm }) => {
            handleTokenAccess(values.token, client, addTokenAccess, setPatient, showMessage, navigate, resetForm);
        },
        validationSchema: Yup.object({
            token: Yup.string().required(translations?.required).min(83, translations?.login?.minChars?.replace(/{(\w+)}/g, '83'))
        })
    });

    if (errorTokenAccess) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    return (
        <Card
            title={translations?.insertToken?.title}
            className="flex justify-content-center align-items-center card-min-height"
        >
            <form className="flex flex-column gap-4" onSubmit={formik.handleSubmit}>
                <FloatLabel>
                    <InputTextarea
                        id="token"
                        autoResize
                        rows={5}
                        cols={30}
                        className="w-full"
                        {...formik.getFieldProps("token")}
                    />
                    <label htmlFor="token">Token</label>
                    {formik.touched.token && formik.errors.token &&<div className="text-red-500 text-xs">{formik.errors.token}</div>}
                </FloatLabel>
                <Button type="submit" label={translations?.confirm} disabled={!formik.isValid || loadingTokenAccess} loading={loadingTokenAccess} />
            </form>
        </Card>
    );
};
export default InsertToken;