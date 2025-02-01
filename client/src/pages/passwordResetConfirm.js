import { Button } from 'primereact/button';
import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { Password } from 'primereact/password';
import { useFormik } from "formik";
import * as Yup from "yup";
import { passwordHeader, passwordFooter } from '../utils/utils';
import { useLanguage } from "../providers/languageContext";


const PasswordResetConfirm = () => {
    const { translations } = useLanguage();

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
                confirmPassword: Yup.string().required(translations?.required).min(8, translations?.error?.minChars?.replace(/{(\w+)}/g, '8'))
                                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, translations?.error?.passwordValidation),
            }),
        });

    return (
        <Card
            title={"Password Reset Confirm"}
            className="flex justify-content-center align-items-center card-min-height"
        >
            <form className="flex flex-column gap-4" onSubmit={formik.handleSubmit}>
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
                <Password
                        inputId="password-confirm"
                        autoComplete="current-password"
                        header={passwordHeader(translations)}
                        footer={passwordFooter(translations)}
                        toggleMask
                        className="w-full login-width"
                        {...formik.getFieldProps("confirmPassword")}
                    />
                    <label htmlFor="password-confirm">{translations?.login?.password}</label>
                    {formik.touched.password && formik.errors.password &&<div className="text-red-500 text-xs">{formik.errors.password}</div>}
                </FloatLabel>
                <Button type="submit" label={translations?.confirm} disabled={!formik.isValid} loading={false}  />
            </form>
</Card>
    );
};
export default PasswordResetConfirm;