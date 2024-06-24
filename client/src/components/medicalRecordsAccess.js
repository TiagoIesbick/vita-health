import { useUser } from "../providers/userContext";
import { useMedicalRecordsByPatientId, useSaveTokenAccess, useTokenId, useUserQuery } from "../hooks/hooks";
import { useNavigate } from "react-router-dom";
import { ACCESS_MEDICAL_TOKEN_KEY, getAccessToken } from "../graphql/auth";
import { useEffect } from "react";
import { Card } from "primereact/card";


const MedicalRecordsAccess = () => {
    const navigate = useNavigate();
    const { user, patient, showMessage } = useUser();
    const { userDetail } = useUserQuery(user.userId);
    const { medicalRecords, loading, error } = useMedicalRecordsByPatientId(patient.patientId);
    const { tokenId } = useTokenId(getAccessToken(ACCESS_MEDICAL_TOKEN_KEY), patient.patientId, patient.exp);
    const { addTokenAccess } = useSaveTokenAccess();

    useEffect(() => {
        (async () => {
            if (tokenId && userDetail) {
                const res = await addTokenAccess(tokenId, userDetail?.doctor.doctorId);
                console.log(res);
            };
        })();
        // eslint-disable-next-line
    }, [tokenId, userDetail]);

    if (loading) {
        return <>Loading...</>
    };
    if (error) {
        navigate('/');
        showMessage('error', 'Error', 'Dados não disponíveis', true);
    };
    return (
        <Card
            title="Dados Médicos"
            className="flex justify-content-center align-items-center"
            style={{minHeight: 'calc(100vh - 128px)'}}
        >
            <pre>
                {JSON.stringify(medicalRecords, undefined, 2)}
            </pre>
        </Card>
    );
};
export default MedicalRecordsAccess;
