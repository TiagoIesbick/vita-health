import { Button } from 'primereact/button';
import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLanguage } from "../providers/languageContext";
import { useUser } from "../providers/userContext";
import { useRequestPasswordReset } from '../hooks/hooks';
import { useNavigate } from 'react-router';


const PasswordReset = () => {
    const navigate = useNavigate();
    const { showMessage } = useUser();
    const { language, translations } = useLanguage();
    const { askPasswordReset, loading, error } = useRequestPasswordReset();

    const formik = useFormik({
            initialValues: {
                email: ''
            },
            onSubmit: async (values, { resetForm }) => {
                const resReset = await askPasswordReset({...values, lang: language})
                if (resReset.resetError) {
                    if (resReset.resetError === 'emailNotExists') navigate('/sign-up');
                    showMessage('error', translations?.error?.title, translations?.error?.[resReset.resetError], true);
                } else if (resReset.resetConfirmation) {
                    resetForm();
                    navigate('/');
                    showMessage('success', translations?.success?.title, translations?.success?.[resReset.resetConfirmation], true);
                };
            },
            validationSchema: Yup.object({
                email: Yup.string().email(translations?.error?.noEmail).required(translations?.required)
            }),
        });

    if (error) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    return (
        <Card
            title={translations?.requestPasswordReset?.title}
            className="flex justify-content-center align-items-center card-min-height"
        >
            <form className="flex flex-column gap-4" onSubmit={formik.handleSubmit}>
                <FloatLabel>
                    <InputText
                        id="email"
                        autoComplete="email"
                        className="w-full"
                        {...formik.getFieldProps("email")}
                    />
                    <label htmlFor="email">E-mail</label>
                    {formik.touched.email && formik.errors.email &&<div className="text-red-500 text-xs">{formik.errors.email}</div>}
                </FloatLabel>
                <Button type="submit" label={translations?.confirm} disabled={loading || !formik.isValid} loading={loading}  />
            </form>
</Card>
    );
};
export default PasswordReset;