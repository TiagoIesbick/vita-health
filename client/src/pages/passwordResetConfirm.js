import { Button } from 'primereact/button';
import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { Password } from 'primereact/password';
import { useFormik } from "formik";
import * as Yup from "yup";
import { passwordHeader, passwordFooter } from '../utils/utils';
import { useLanguage } from "../providers/languageContext";
import { useUser } from "../providers/userContext";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { usePasswordReset } from '../hooks/hooks';


const PasswordResetConfirm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { showMessage } = useUser();
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const { updatePassword, loading, error } = usePasswordReset();
    const token = new URLSearchParams(location.search).get('token');

    const formik = useFormik({
            initialValues: {
                newPassword: '',
                confirmPassword: '',
            },
            onSubmit: async (values, { resetForm }) => {
                const resReset = await updatePassword({...values, token: token});
                if (resReset.resetError) {
                    showMessage('error', translations?.error?.title, translations?.error?.[resReset.resetError], true);
                } else if (resReset.resetConfirmation) {
                    resetForm();
                    navigate('/login');
                    showMessage('success', translations?.success?.title, translations?.success?.[resReset.resetConfirmation], true);
                };
            },
            validationSchema: Yup.object({
                newPassword: Yup.string().required(translations?.required).min(8, translations?.error?.minChars?.replace(/{(\w+)}/g, '8'))
                                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, translations?.error?.passwordValidation),
                confirmPassword: Yup.string().required(translations?.required)
                                    .oneOf([Yup.ref('newPassword')], translations?.error?.passwordMismatch),
            }),
        });

    useEffect(() => {
        if (!token) {
            setErrorMessage('invalidLink');
            return;
        };
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                setErrorMessage('expiredAccess');
                return;
            }
            setEmail(decoded.email);
        } catch (error) {
            console.log('Error:', error);
            setErrorMessage('invalidLink');
        };
    }, [token, navigate]);

    useEffect(() => {
        if (errorMessage && translations?.error) {
            showMessage('error', translations.error.title, translations.error[errorMessage], true);
            navigate('/');
        }
    }, [errorMessage, translations, showMessage, navigate]);

    if (error) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    return (
        <Card
            title={translations?.passwordReset?.title}
            className="flex justify-content-center align-items-center card-min-height"
        >
            <form className="flex flex-column gap-4" onSubmit={formik.handleSubmit}>
                <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    readOnly
                    className='hidden'
                    tabIndex="-1"
                />
                <FloatLabel>
                    <Password
                        inputId="password"
                        autoComplete="new-password"
                        header={passwordHeader(translations)}
                        footer={passwordFooter(translations)}
                        toggleMask
                        className="w-full login-width"
                        {...formik.getFieldProps("newPassword")}
                    />
                    <label htmlFor="password">{translations?.passwordReset?.newPassword}</label>
                    {formik.touched.newPassword && formik.errors.newPassword &&<div className="text-red-500 text-xs">{formik.errors.newPassword}</div>}
                </FloatLabel>
                <FloatLabel>
                    <Password
                        inputId="confirm-password"
                        autoComplete="new-password"
                        feedback={false}
                        toggleMask
                        className="w-full login-width"
                        {...formik.getFieldProps("confirmPassword")}
                    />
                    <label htmlFor="confirm-password">{translations?.passwordReset?.confirmPassword}</label>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword &&<div className="text-red-500 text-xs">{formik.errors.confirmPassword}</div>}
                </FloatLabel>
                <Button type="submit" label={translations?.confirm} disabled={loading || !formik.isValid} loading={loading}  />
            </form>
        </Card>
    );
};
export default PasswordResetConfirm;