import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useUpdateDoctorUser, useUpdateUser } from "../hooks/hooks";
import { ACCESS_TOKEN_KEY, storeToken } from "../graphql/auth";
import { useNavigate } from "react-router-dom";


const EditDoctorProfile = ({ user, setUser, doctor, showMessage }) => {
    const navigate = useNavigate();
    const { editUser, loadingUpdateUser, errorUpdateUser } = useUpdateUser();
    const { editDoctorUser, loadingUpdateDoctorUser, errorUpdateDoctorUser } = useUpdateDoctorUser();
    const formik = useFormik({
        initialValues: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            specialty: doctor.specialty || '',
            licenseNumber: doctor.licenseNumber || '',
        },
        onSubmit: async (values) => {
            const { specialty: _, licenseNumber: __, ...userValues } = values;
            const resUser = await editUser(userValues);
            if (resUser.userError) {
                showMessage('error', 'Error', resUser.userError);
            } else if (resUser.token) {
                storeToken(ACCESS_TOKEN_KEY, resUser.token);
                const resDoctorUser = await editDoctorUser({ specialty: values.specialty, licenseNumber: values.licenseNumber});
                if (resDoctorUser.userError) {
                    showMessage('error', 'Error', resDoctorUser.userError);
                } else {
                    setUser(resDoctorUser.user);
                    showMessage('success', 'Success', resDoctorUser.userConfirmation);
                };
            };
        },
        validationSchema: Yup.object({
            firstName: Yup.string().required('Required').min(2, 'Minimum 2 characters')
                .matches(/^\s*?\w{2,}.*/, 'First name must start with at least 2 word characters'),
            lastName: Yup.string().required('Required').min(2, 'Minimum 2 characters')
                .matches(/^\s*?\w{2,}.*/, 'Last name must start with at least 2 word characters'),
            email: Yup.string().email('Invalid e-mail').required('Required'),
            specialty: Yup.string().required('Required').min(2, 'Minimum 2 characters'),
            licenseNumber: Yup.string().required('Required')
        }),
    });

    if (errorUpdateUser || errorUpdateDoctorUser) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <Card
            title="Edit Profile"
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
                    <InputText
                        id="specialty"
                        autoComplete="on"
                        className="w-full"
                        {...formik.getFieldProps("specialty")}
                    />
                    <label htmlFor="specialty">Specialty</label>
                    {formik.touched.specialty && formik.errors.specialty &&<div className="text-red-500 text-xs">{formik.errors.specialty}</div>}
                </FloatLabel>
                <FloatLabel>
                    <InputText
                        id="license-number"
                        autoComplete="on"
                        className="w-full"
                        {...formik.getFieldProps("licenseNumber")}
                    />
                    <label htmlFor="license-number">License Number</label>
                    {formik.touched.licenseNumber && formik.errors.licenseNumber &&<div className="text-red-500 text-xs">{formik.errors.licenseNumber}</div>}
                </FloatLabel>
                <Button type="submit" label="Confirm" disabled={!formik.isValid || loadingUpdateUser || loadingUpdateDoctorUser } loading={loadingUpdateUser || loadingUpdateDoctorUser} />
            </form>
        </Card>
    );
};
export default EditDoctorProfile;