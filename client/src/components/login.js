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
import { useNavigate } from 'react-router';
import { logout, storeToken, ACCESS_TOKEN_KEY } from "../graphql/auth";

const Login = () => {
    const navigate = useNavigate();
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
                showMessage('error', 'Error', login.error, true);
                logout();
                setUser(null);
            } else if (login.token) {
                storeToken(ACCESS_TOKEN_KEY, login.token);
                setUser(login.user);
                navigate('/');
                showMessage('success', 'Logged In', `Welcome ${login.user.firstName}`);
            };
        },
        validationSchema: Yup.object({
            email: Yup.string().email('E-mail inválido').required('Obrigatório'),
            password: Yup.string().required('Obrigatório').min(8, 'Mínimo 8 caracteres')
                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, 'Pelo menos 1 letra minúscula, 1 letra maiúscula e 1 número')
        }),
    });
    if (error) {
        navigate('/');
        showMessage('error', 'Error', 'Sorry, we are experiencing some issues at the moment, please try again later', true);
    };

    return (
        <Card
            title="Login"
            className="flex justify-content-center align-items-center"
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
                        header={passwordHeader}
                        footer={passwordFooter}
                        toggleMask
                        className="w-full"
                        {...formik.getFieldProps("password")}
                    />
                    <label htmlFor="password">Senha</label>
                    {formik.touched.password && formik.errors.password &&<div className="text-red-500 text-xs">{formik.errors.password}</div>}
                </FloatLabel>
                <Button type="submit" label="Login" disabled={loading || !formik.isValid} loading={loading}  />
            </form>
            <Divider />
            <div className="flex flex-column mt-4 text-center text-sm">
                Não tem uma conta?
                <Link className='mt-1' to="/create-user">Crie uma conta</Link>
            </div>
        </Card>
    );
};
export default Login;