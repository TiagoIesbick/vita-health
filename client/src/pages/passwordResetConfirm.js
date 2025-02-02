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


const PasswordResetConfirm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { showMessage } = useUser();
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const token = new URLSearchParams(location.search).get('token');

    const formik = useFormik({
            initialValues: {
                password: '',
                confirmPassword: '',
            },
            onSubmit: async (values) => {
                console.log(values);
            },
            validationSchema: Yup.object({
                password: Yup.string().required(translations?.required).min(8, translations?.error?.minChars?.replace(/{(\w+)}/g, '8'))
                                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, translations?.error?.passwordValidation),
                confirmPassword: Yup.string().required(translations?.required)
                                    .oneOf([Yup.ref('password')], translations?.error?.passwordMismatch),
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
                        {...formik.getFieldProps("password")}
                    />
                    <label htmlFor="password">{translations?.login?.password}</label>
                    {formik.touched.password && formik.errors.password &&<div className="text-red-500 text-xs">{formik.errors.password}</div>}
                </FloatLabel>
                <FloatLabel>
                    <Password
                        inputId="password-confirm"
                        autoComplete="new-password"
                        feedback={false}
                        toggleMask
                        className="w-full login-width"
                        {...formik.getFieldProps("confirmPassword")}
                    />
                    <label htmlFor="password-confirm">{translations?.passwordReset?.confirmPassword}</label>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword &&<div className="text-red-500 text-xs">{formik.errors.confirmPassword}</div>}
                </FloatLabel>
                <Button type="submit" label={translations?.confirm} disabled={!formik.isValid} loading={false}  />
            </form>
        </Card>
    );
};
export default PasswordResetConfirm;