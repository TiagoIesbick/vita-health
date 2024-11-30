import { Card } from "primereact/card";
import { useDoctorPatients } from "../hooks/hooks";
import { useUser } from "../providers/userContext";
import { useNavigate } from 'react-router';
import LoadingSkeleton from "../components/skeleton";


const Patients = () => {
    const navigate = useNavigate();
    const { showMessage } = useUser();
    const {doctorPatients, loadingDoctorPatients, errorDoctorPatients} = useDoctorPatients();

    if (loadingDoctorPatients) return <LoadingSkeleton />;

    if (errorDoctorPatients) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };
    console.log(doctorPatients);

    return (
        <Card className="card-min-height" title="Patients">
            Patients
        </Card>
    );
};
export default Patients;