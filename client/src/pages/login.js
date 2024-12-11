import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { useFormik } from "formik";
import * as Yup from "yup";
import { passwordHeader, passwordFooter } from '../utils/utils';
import { Link } from "react-router-dom";
import { useLogin } from "../hooks/hooks";
import { useUser } from "../providers/userContext";
import { useLanguage } from "../providers/languageContext";
import { useNavigate } from 'react-router';
import { logout, storeToken, ACCESS_TOKEN_KEY } from "../graphql/auth";
import { useApolloClient } from "@apollo/client";
import './login.css';


const Login = () => {
    const navigate = useNavigate();
    const client = useApolloClient();
    const { translations } = useLanguage();
    const { setUser, showMessage } = useUser();
    const { doLogin, loading, error } = useLogin();
    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit: async (values) => {
            const login = await doLogin(values);
            if (login.error) {
                showMessage('error', translations?.error?.error, login.error, true);
                logout();
                setUser(null);
            } else if (login.token) {
                storeToken(ACCESS_TOKEN_KEY, login.token);
                setUser(login.user);
                client.resetStore();
                login.user.userType === 'Patient' ? navigate('/medical-records') : navigate('/insert-token');
                showMessage('success', translations?.login?.loggedIn, `${translations?.login?.welcome} ${login.user.firstName}`);
            };
        },
        validationSchema: Yup.object({
            email: Yup.string().email(translations?.login?.noEmail).required(translations?.required),
            password: Yup.string().required(translations?.required).min(8, translations?.login?.min8Chars)
                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, translations?.login?.validation)
        }),
    });
    if (error) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    return (
        <Card
            title="Login"
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
                <FloatLabel>
                    <Password
                        inputId="password"
                        autoComplete="current-password"
                        header={passwordHeader(translations)}
                        footer={passwordFooter(translations)}
                        toggleMask
                        className="w-full login-width"
                        {...formik.getFieldProps("password")}
                    />
                    <label htmlFor="password">{translations?.login?.password}</label>
                    {formik.touched.password && formik.errors.password &&<div className="text-red-500 text-xs">{formik.errors.password}</div>}
                </FloatLabel>
                <Button type="submit" label={translations?.navbar?.login} disabled={loading || !formik.isValid} loading={loading}  />
            </form>
            <Divider />
            <div className="flex flex-column mt-4 text-center text-sm">
                {translations?.login?.noAccount}
                <Link className='mt-1' to="/sign-up">{translations?.navbar?.signUp}</Link>
            </div>
        </Card>
    );
};
export default Login;