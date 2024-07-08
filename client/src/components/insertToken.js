import { useFormik } from "formik";
import * as Yup from "yup";
import { FloatLabel } from "primereact/floatlabel";
import { Card } from 'primereact/card';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from "primereact/button";
import { ACCESS_MEDICAL_TOKEN_KEY, getCredentials, storeToken } from "../graphql/auth";
import { useUser } from "../providers/userContext";
import { useNavigate } from "react-router-dom";
import { useSaveTokenAccess, useUserQuery } from "../hooks/hooks";


const InsertToken = () => {
    const navigate = useNavigate();
    const { user, setPatient, showMessage } = useUser();
    const { userDetail } = useUserQuery(user.userId);
    const { addTokenAccess } = useSaveTokenAccess();
    const formik = useFormik({
        initialValues: {
            token: ''
        },
        onSubmit: async (values, { resetForm }) => {
            storeToken(ACCESS_MEDICAL_TOKEN_KEY, values.token);
            const credentials = getCredentials(ACCESS_MEDICAL_TOKEN_KEY);
            if (Date.parse(credentials.exp) <= Date.now()) {
                showMessage('error', 'Error', 'Token expirado');
                setPatient(null);
                localStorage.removeItem(ACCESS_MEDICAL_TOKEN_KEY);
            } else {
                setPatient(credentials);
                await addTokenAccess(credentials.tokenId, userDetail?.doctor.doctorId);
                navigate("/medical-records-access");
                showMessage('success', 'Sucess', 'Permission Granted');
            };
            resetForm();
        },
        validationSchema: Yup.object({
            token: Yup.string().required('Required').min(83, 'Minimum 83 characters')
        })
    });


    return (
        <Card
            title="Insert Token"
            className="flex justify-content-center align-items-center"
            style={{minHeight: 'calc(100vh - 128px)'}}
        >
            <form className="flex flex-column gap-4" onSubmit={formik.handleSubmit}>
                <FloatLabel>
                    <InputTextarea
                        id="token"
                        autoResize
                        rows={5}
                        cols={30}
                        {...formik.getFieldProps("token")}
                    />
                    <label htmlFor="token">Token</label>
                    {formik.touched.token && formik.errors.token &&<div className="text-red-500 text-xs">{formik.errors.token}</div>}
                </FloatLabel>
                <Button type="submit" label="Confirm" disabled={!formik.isValid} />
            </form>
        </Card>
    );
};
export default InsertToken;