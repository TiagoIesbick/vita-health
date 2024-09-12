import { useFormik } from "formik";
import * as Yup from "yup";
import { FloatLabel } from "primereact/floatlabel";
import { Card } from 'primereact/card';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from "primereact/button";
import { ACCESS_MEDICAL_TOKEN_KEY, deleteCookie, getCredentials, storeToken } from "../graphql/auth";
import { useUser } from "../providers/userContext";
import { useNavigate } from "react-router-dom";
import { useSaveTokenAccess } from "../hooks/hooks";
import { useApolloClient } from "@apollo/client";
import { medicalRecordsQuery } from "../graphql/queries";


const InsertToken = () => {
    const navigate = useNavigate();
    const client = useApolloClient();
    const { setPatient, showMessage } = useUser();
    const { addTokenAccess, loadingTokenAccess, errorTokenAccess } = useSaveTokenAccess();
    const formik = useFormik({
        initialValues: {
            token: ''
        },
        onSubmit: async (values, { resetForm }) => {
            storeToken(ACCESS_MEDICAL_TOKEN_KEY, values.token);
            const resTokenAccess = await addTokenAccess(values.token);
            if (resTokenAccess.accessError) {
                showMessage('error', 'Error', resTokenAccess.accessError);
                setPatient(null);
                deleteCookie(ACCESS_MEDICAL_TOKEN_KEY);
            } else {
                const credentials = getCredentials(ACCESS_MEDICAL_TOKEN_KEY);
                setPatient(credentials);
                const cachedData = client.cache.readQuery({ query: medicalRecordsQuery });
                if (cachedData) {
                    client.refetchQueries({ include: ["medicalRecords"] });
                };
                navigate("/medical-records-access");
                showMessage('success', 'Sucess', 'Permission Granted');
                resetForm()
            };
        },
        validationSchema: Yup.object({
            token: Yup.string().required('Required').min(83, 'Minimum 83 characters')
        })
    });

    if (errorTokenAccess) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <Card
            title="Insert Token"
            className="flex justify-content-center align-items-center card-min-height"
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
                <Button type="submit" label="Confirm" disabled={!formik.isValid || loadingTokenAccess} loading={loadingTokenAccess} />
            </form>
        </Card>
    );
};
export default InsertToken;