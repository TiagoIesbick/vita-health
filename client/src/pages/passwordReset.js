import { Button } from 'primereact/button';
import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLanguage } from "../providers/languageContext";


const PasswordReset = () => {
    const { translations } = useLanguage();

    const formik = useFormik({
            initialValues: {
                email: ''
            },
            onSubmit: async (values) => {
                console.log(values);
            },
            validationSchema: Yup.object({
                email: Yup.string().email(translations?.error?.noEmail).required(translations?.required)
            }),
        });

    return (
        <Card
            title={"Password Reset"}
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
                <Button type="submit" label={translations?.confirm} disabled={!formik.isValid} loading={false}  />
            </form>
</Card>
    );
};
export default PasswordReset;