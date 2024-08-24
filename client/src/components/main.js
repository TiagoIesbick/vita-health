import Home from "../pages/home";
import MedicalRecords from "../pages/medicalRecords";
import Login from "../pages/login";
import CreateUser from "../pages/createUser";
import EditProfile from "../pages/editProfile";
import GenerateAccessToken from "../pages/generateAccessToken";
import InsertToken from "../pages/insertToken";
import MedicalRecordsAccess from "../pages/medicalRecordsAccess";
import ActiveTokens from "../pages/activeTokens";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toast } from 'primereact/toast';
import { useUser } from "../providers/userContext";


const Main = () => {
    const { user, toast, patient } = useUser();
    return (
        <main>
            <Toast ref={toast} position="top-center" />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/create-user" element={<CreateUser />} />
                <Route path="/edit-profile" element={user ? <EditProfile /> : <Navigate to="/" replace />} />
                <Route path="/medical-records" element={user && user.userType === 'Patient' ? <MedicalRecords /> : <Navigate to="/" replace />} />
                <Route path="/generate-access-token" element={user && user.userType === 'Patient' ? <GenerateAccessToken /> : <Navigate to="/" replace />} />
                <Route path="/insert-token" element={user && user.userType === 'Doctor' ? <InsertToken /> : <Navigate to="/" replace />} />
                <Route path="/medical-records-access" element={user && user.userType === 'Doctor' && patient ? <MedicalRecordsAccess />: <Navigate to="/" replace />} />
                <Route path="/active-tokens" element={user ? <ActiveTokens /> : <Navigate to="/" replace />} />
            </Routes>
        </main>
    );
};
export default Main;
