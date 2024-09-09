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
import { useApolloClient } from "@apollo/client";


const CreateUser = () => {
    const navigate = useNavigate();
    const client = useApolloClient();
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
                        client.resetStore();
                        navigate('/');
                        showMessage('success', 'Logged In', `Welcome ${login.user.firstName}`)
                    };
                };
            };
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('Required').min(2, 'Minimum 2 characters')
                .matches(/^\s*?\w{2,}.*/, 'First name must start with at least 2 word characters'),
            lastName: Yup.string().required('Required').min(2, 'Minimum 2 characters')
                .matches(/^\s*?\w{2,}.*/, 'Last name must start with at least 2 word characters'),
            email: Yup.string().email('Invalid e-mail').required('Required'),
            password: Yup.string().required('Required').min(8, 'Minimum 8 characters')
                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, 'At least one lowercase, one uppercase and one numeric'),
            userType: Yup.string().required('Required'),
            acceptTerms: Yup.bool().oneOf([true], 'You must accept the terms and conditions')
        }),
    });
    const userType = [
        { type: 'Patient', name: 'Patient'},
        { type: 'Doctor', name: 'Healthcare professional'}
    ]
    if (errorUser || errorPatientOrDoctor || error) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <Card
            title="Sign Up"
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
                    <label htmlFor="firstName">First Name</label>
                    {formik.touched.firstName && formik.errors.firstName &&<div className="text-red-500 text-xs">{formik.errors.firstName}</div>}
                </FloatLabel>
                <FloatLabel>
                    <InputText
                        id="lastName"
                        autoComplete="family-name"
                        className="w-full"
                        {...formik.getFieldProps("lastName")}
                    />
                    <label htmlFor="lastName">Last Name</label>
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
                        header={passwordHeader}
                        footer={passwordFooter}
                        toggleMask
                        className="w-full"
                        {...formik.getFieldProps("password")}
                    />
                    <label htmlFor="password">Password</label>
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
                    <label htmlFor="user-type">User Type</label>
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
                    <label htmlFor="acceptTerms" className="ml-1 text-sm">Accept Terms</label>
                    {formik.touched.acceptTerms && formik.errors.acceptTerms &&<div className="text-red-500 text-xs">{formik.errors.acceptTerms}</div>}
                </div>
                <Button type="submit" label="Sign Up" disabled={!formik.isValid || loadingUser || loadingPatientOrDoctor || loading} loading={loadingUser || loadingPatientOrDoctor || loading} />
            </form>
        </Card>
    );
};
export default CreateUser;