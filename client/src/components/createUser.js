import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from "primereact/checkbox";
import { Button } from 'primereact/button';
import { useFormik } from "formik";
import * as Yup from "yup";
import { passwordHeader, passwordFooter } from '../utils/utils';
import { useCreatePatientOrDoctor, useCreateUser, useLogin } from "../hooks/hooks";
import { useUser } from "../providers/userContext";
import { useNavigate } from "react-router-dom";
import { logout, storeToken, ACCESS_TOKEN_KEY } from "../graphql/auth";


const CreateUser = () => {
    const navigate = useNavigate();
    const { setUser, showMessage } = useUser();
    const { addUser, loadingUser, errorUser } = useCreateUser();
    const { addPatientOrDoctor, loadingPatientOrDoctor, errorPatientOrDoctor } = useCreatePatientOrDoctor();
    const { doLogin, loading, error } = useLogin();
    const formik = useFormik({
        initialValues: {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            userType: null,
            acceptTerms: false
        },
        onSubmit: async (values, { resetForm }) => {
            const resUser = await addUser(values);
            if (resUser.userError) {
                showMessage('error', 'Error', resUser.userError)
            } else {
                const resPatientOrDoctor = await addPatientOrDoctor(resUser.user.userId, resUser.user.userType);
                if (resPatientOrDoctor.userError) {
                    showMessage('error', 'Error', resPatientOrDoctor.userError)
                } else {
                    const login = await doLogin({ email: values.email, password: values.password});
                    if (login.error) {
                        showMessage('error', 'Error', login.error);
                        logout();
                        setUser(null);
                    } else if (login.token) {
                        storeToken(ACCESS_TOKEN_KEY, login.token);
                        setUser(login.user);
                        resetForm();
                        navigate('/');
                        showMessage('success', 'Logged In', `Welcome ${login.user.firstName}`)
                    };
                };
            };
        },
        validationSchema: Yup.object({
            email: Yup.string().email('E-mail inválido').required('Obrigatório'),
            firstName: Yup.string().required('Obrigatório').min(2, 'Pelo menos 2 caracteres')
                .matches(/^\s*?\w{2,}.*/, 'Nome deve começar com pelo menos 2 caracteres de palavra'),
            lastName: Yup.string().required('Obrigatório').min(2, 'Pelo menos 2 caracteres')
                .matches(/^\s*?\w{2,}.*/, 'Sobrenome deve começar com pelo menos 2 caracteres de palavra'),
            password: Yup.string().required('Obrigatório').min(8, 'Mínimo 8 caracteres')
                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, 'Pelo menos 1 letra minúscula, 1 letra maiúscula e 1 número'),
            userType: Yup.string().required('Obrigatório'),
            acceptTerms: Yup.bool().oneOf([true], 'É preciso aceitar os termos e condições')
        }),
    });
    const userType = [
        { type: 'Patient', name: 'Paciente'},
        { type: 'Doctor', name: 'Profisional de Saúde'}
    ]
    if (errorUser || errorPatientOrDoctor || error) {
        navigate('/');
        showMessage('error', 'Error', 'Sorry, we are experiencing some issues at the moment, please try again later', true);
    };

    return (
        <Card
            title="Crie uma Conta"
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
                    <InputText
                        id="firstName"
                        autoComplete="given-name"
                        className="w-full"
                        {...formik.getFieldProps("firstName")}
                    />
                    <label htmlFor="firstName">Nome</label>
                    {formik.touched.firstName && formik.errors.firstName &&<div className="text-red-500 text-xs">{formik.errors.firstName}</div>}
                </FloatLabel>
                <FloatLabel>
                    <InputText
                        id="lastName"
                        autoComplete="family-name"
                        className="w-full"
                        {...formik.getFieldProps("lastName")}
                    />
                    <label htmlFor="lastName">Sobrenome</label>
                    {formik.touched.lastName && formik.errors.lastName &&<div className="text-red-500 text-xs">{formik.errors.lastName}</div>}
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
                <FloatLabel>
                    <Dropdown
                        inputId="user-type"
                        options={userType}
                        optionValue="type"
                        optionLabel="name"
                        className="w-full"
                        {...formik.getFieldProps("userType")}
                    />
                    <label htmlFor="user-type">Tipo de Usuário</label>
                    {formik.touched.userType && formik.errors.userType &&<div className="text-red-500 text-xs">{formik.errors.userType}</div>}
                </FloatLabel>
                <div>
                    <Checkbox
                        onChange={(e) => {
                            formik.setFieldTouched("acceptTerms", true);
                            formik.setFieldValue("acceptTerms", e.checked);
                        }}
                        inputId="acceptTerms"
                        checked={formik.values.acceptTerms} />
                    <label htmlFor="acceptTerms" className="ml-1 text-sm">Aceite de Termos</label>
                    {formik.touched.acceptTerms && formik.errors.acceptTerms &&<div className="text-red-500 text-xs">{formik.errors.acceptTerms}</div>}
                </div>
                <Button type="submit" label="Confirme" disabled={!formik.isValid || loadingUser || loadingPatientOrDoctor || loading} loading={loadingUser || loadingPatientOrDoctor || loading} />
            </form>
        </Card>
    );
};
export default CreateUser;