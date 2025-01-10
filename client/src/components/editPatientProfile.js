import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from "primereact/calendar";
import { localDateTime, toDay } from "../utils/utils";
import { Button } from 'primereact/button';
import { useLanguage } from "../providers/languageContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useUpdatePatientUser, useUpdateUser } from "../hooks/hooks";
import { storeToken, ACCESS_TOKEN_KEY } from "../graphql/auth";
import { useNavigate } from "react-router-dom";


const EditPatientProfile = ({ user, setUser, patient, showMessage }) => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { editUser, loadingUpdateUser, errorUpdateUser } = useUpdateUser();
    const { editPatientUser, loadingUpdatePatientUser, errorUpdatePatientUser } = useUpdatePatientUser();

    const formik = useFormik({
        initialValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            dateOfBirth: localDateTime(patient.dateOfBirth),
            gender: patient.gender,
        },
        onSubmit: async (values) => {
            const { dateOfBirth: _, gender: __, ...userValues} = values;
            const resUser = await editUser(userValues);
            if (resUser.userError) {
                showMessage('error', translations?.error?.title, translations?.error?.[resUser.userError]);
            } else if (resUser.token) {
                storeToken(ACCESS_TOKEN_KEY, resUser.token);
                const resPatientUser = await editPatientUser({ dateOfBirth: values.dateOfBirth, gender: values.gender});
                if (resPatientUser.userError) {
                    showMessage('error', translations?.error?.title, translations?.error?.[resPatientUser.userError]);
                } else {
                    setUser(resUser.user);
                    showMessage('success', translations?.success?.title, translations?.success?.[resPatientUser.userConfirmation]);
                };
            };
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required(translations?.required).min(2, translations?.error?.minChars?.replace(/{(\w+)}/g, '2'))
                .matches(/^\s*?\w{2,}.*/, translations?.error?.firstNameValidation),
            lastName: Yup.string().required(translations?.required).min(2, translations?.error?.minChars?.replace(/{(\w+)}/g, '2'))
                .matches(/^\s*?\w{2,}.*/, translations?.error?.lastNameValidation),
            email: Yup.string().email(translations?.error?.noEmail).required(translations?.required),
            dateOfBirth: Yup.date().required(translations?.required).max(toDay, translations?.error?.dobValidation),
            gender: Yup.string().required(translations?.required)
        }),
    });

    if (errorUpdateUser || errorUpdatePatientUser) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    return (
        <Card
            title={translations?.editProfile?.title}
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
                    <Calendar
                        className="w-full"
                        inputId="date-of-birth"
                        dateFormat={translations?.generateToken?.dateFormat}
                        maxDate={toDay}
                        showIcon
                        {...formik.getFieldProps("dateOfBirth")}
                    />
                    <label htmlFor="date-of-birth">{translations?.editProfile?.dob}</label>
                    {formik.touched.dateOfBirth && formik.errors.dateOfBirth &&<div className="text-red-500 text-xs">{formik.errors.dateOfBirth}</div>}
                </FloatLabel>
                <div className="flex flex-wrap gap-3">
                    <div className="flex align-items-center">
                        <RadioButton
                            inputId="male"
                            name="male"
                            value="male"
                            onChange={(e) => {
                                formik.setFieldTouched("gender", true);
                                formik.setFieldValue("gender", e.value);
                            }}
                            checked={formik.values.gender === 'male'}
                        />
                        <label htmlFor="male" className="ml-2">{translations?.editProfile?.male}</label>
                    </div>
                    <div className="flex align-items-center">
                        <RadioButton
                            inputId="female"
                            name="female"
                            value="female"
                            onChange={(e) => {
                                formik.setFieldTouched("gender", true);
                                formik.setFieldValue("gender", e.value);
                            }}
                            checked={formik.values.gender === 'female'}
                        />
                        <label htmlFor="female" className="ml-2">{translations?.editProfile?.female}</label>
                    </div>
                    <div className="flex align-items-center">
                        <RadioButton
                            inputId="other"
                            name="other"
                            value="other"
                            onChange={(e) => {
                                formik.setFieldTouched("gender", true);
                                formik.setFieldValue("gender", e.value);
                            }}
                            checked={formik.values.gender === 'other'}
                        />
                        <label htmlFor="other" className="ml-2">{translations?.insertMedicalRecord?.other}</label>
                    </div>
                    {formik.touched.gender && formik.errors.gender &&<div className="text-red-500 text-xs">{formik.errors.gender}</div>}
                </div>
                <Button type="submit" label={translations?.confirm} disabled={!formik.isValid || loadingUpdateUser || loadingUpdatePatientUser} loading={loadingUpdateUser || loadingUpdatePatientUser} />
            </form>
        </Card>
    );
};
export default EditPatientProfile;