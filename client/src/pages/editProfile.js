import EditPatientProfile from "../components/editPatientProfile";
import EditDoctorProfile from "../components/editDoctorProfile";
import { useUser } from "../providers/userContext";
import { useUserQuery } from "../hooks/hooks";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../providers/languageContext";
import LoadingSkeleton from "../components/skeleton";


const EditProfile = () => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { user, setUser, showMessage } = useUser();
    const { userDetail, loadingUser, errorUser } = useUserQuery(user.userId);
    if (loadingUser) {
        return <LoadingSkeleton />
    };
    if (errorUser) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };
    return (
        <>
            {user && user.userType === 'Patient' && <EditPatientProfile patient={userDetail.patient} user={user} setUser={setUser} showMessage={showMessage} />}
            {user && user.userType === 'Doctor' && <EditDoctorProfile doctor={userDetail.doctor} user={user} setUser={setUser} showMessage={showMessage} />}
        </>
    );
};
export default EditProfile;