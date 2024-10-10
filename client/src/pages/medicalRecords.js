import { useUser } from "../providers/userContext";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router';
import { useInfiniteMedicalRecords } from "../hooks/hooks";
import LoadingSkeleton from "../components/skeleton";
import MedicalRecordsCard from "../components/medicalRecordsCard";


const MedicalRecords = () => {
    const navigate = useNavigate();
    const { showMessage } = useUser();
    const { allRecords, medicalRecords, loading, error, loader } = useInfiniteMedicalRecords();


    if (loading && allRecords.length === 0) {
        return <LoadingSkeleton />
    };

    if (error) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <MedicalRecordsCard
            title="Health History"
            allRecords={allRecords}
            medicalRecords={medicalRecords}
            loading={loading}
            loader={loader}
            emptyMessage={
                <>
                    <p>You have no health history yet.</p>
                    <p>Start by adding your health data <Link to="/insert-medical-record">here</Link> to begin building your records.</p>
                    <p>Alternatively, generate a token <Link to="/generate-access-token">here</Link> to share with your health professional so they can add new information.</p>
                </>
            }
        />
    );
};
export default MedicalRecords;
