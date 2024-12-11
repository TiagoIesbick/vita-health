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
import { useLanguage } from "../providers/languageContext";
import { useNavigate } from "react-router-dom";
import { logout, storeToken, ACCESS_TOKEN_KEY } from "../graphql/auth";
import { useApolloClient } from "@apollo/client";


const CreateUser = () => {
    const navigate = useNavigate();
    const client = useApolloClient();
    const { translations } = useLanguage();
    const { setUser, showMessage } = useUser();
    const { addUser, loadingUser, errorUser } = useCreateUser();
    const { addPatientOrDoctor, loadingPatientOrDoctor, errorPatientOrDoctor } = useCreatePatientOrDoctor();
    const { doLogin, loading, error } = useLogin();
    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            userType: null,
            acceptTerms: false
        },
        onSubmit: async (values, { resetForm }) => {
            const resUser = await addUser(values);
            if (resUser.userError) {
                showMessage('error', translations?.error?.error, resUser.userError)
            } else {
                const resPatientOrDoctor = await addPatientOrDoctor(resUser.user.userId, resUser.user.userType);
                if (resPatientOrDoctor.userError) {
                    showMessage('error', translations?.error?.error, resPatientOrDoctor.userError)
                } else {
                    const login = await doLogin({ email: values.email, password: values.password});
                    if (login.error) {
                        showMessage('error', translations?.error?.error, login.error);
                        logout();
                        setUser(null);
                    } else if (login.token) {
                        storeToken(ACCESS_TOKEN_KEY, login.token);
                        setUser(login.user);
                        resetForm();
                        client.resetStore();
                        login.user.userType === 'Patient' ? navigate('/medical-records') : navigate('/insert-token');
                        showMessage('success', translations?.login?.loggedIn, `${translations?.login?.welcome} ${login.user.firstName}`)
                    };
                };
            };
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required(translations?.required).min(2, translations?.login?.minChars?.replace(/{(\w+)}/g, '2'))
                .matches(/^\s*?\w{2,}.*/, translations?.createUser?.firstNameValidation),
            lastName: Yup.string().required(translations?.required).min(2, translations?.login?.minChars?.replace(/{(\w+)}/g, '2'))
                .matches(/^\s*?\w{2,}.*/, translations?.createUser?.lastNameValidation),
            email: Yup.string().email(translations?.login?.noEmail).required(translations?.required),
            password: Yup.string().required(translations?.required).min(8, translations?.login?.minChars?.replace(/{(\w+)}/g, '8'))
                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, translations?.login?.validation),
            userType: Yup.string().required(translations?.required),
            acceptTerms: Yup.bool().oneOf([true], translations?.createUser?.acceptTermsValidation)
        }),
    });
    const userType = [
        { type: 'Patient', name: translations?.patient},
        { type: 'Doctor', name: translations?.doctor}
    ]
    if (errorUser || errorPatientOrDoctor || error) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    return (
        <Card
            title={translations?.navbar?.signUp}
            className="flex justify-content-center align-items-center card-min-height"
        >
            <form className="flex flex-column gap-4" onSubmit={formik.handleSubmit}>
                <FloatLabel>
                    <InputText
                        id="firstName"
                        autoComplete="given-name"
                        className="w-full"
                        {...formik.getFieldProps("firstName")}
                    />
                    <label htmlFor="firstName">{translations?.createUser?.firstName}</label>
                    {formik.touched.firstName && formik.errors.firstName &&<div className="text-red-500 text-xs">{formik.errors.firstName}</div>}
                </FloatLabel>
                <FloatLabel>
                    <InputText
                        id="lastName"
                        autoComplete="family-name"
                        className="w-full"
                        {...formik.getFieldProps("lastName")}
                    />
                    <label htmlFor="lastName">{translations?.createUser?.lastName}</label>
                    {formik.touched.lastName && formik.errors.lastName &&<div className="text-red-500 text-xs">{formik.errors.lastName}</div>}
                </FloatLabel>
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
                <FloatLabel>
                    <Dropdown
                        inputId="user-type"
                        options={userType}
                        optionValue="type"
                        optionLabel="name"
                        className="w-full"
                        {...formik.getFieldProps("userType")}
                    />
                    <label htmlFor="user-type">{translations?.createUser?.userType}</label>
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
                    <label htmlFor="acceptTerms" className="ml-1 text-sm">{translations?.createUser?.acceptTerms}</label>
                    {formik.touched.acceptTerms && formik.errors.acceptTerms &&<div className="text-red-500 text-xs">{formik.errors.acceptTerms}</div>}
                </div>
                <Button type="submit" label={translations?.confirm} disabled={!formik.isValid || loadingUser || loadingPatientOrDoctor || loading} loading={loadingUser || loadingPatientOrDoctor || loading} />
            </form>
        </Card>
    );
};
export default CreateUser;