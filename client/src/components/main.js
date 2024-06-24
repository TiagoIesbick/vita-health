import Home from "./home";
import MedicalRecords from "./medicalRecords";
import Login from "./login";
import CreateUser from "./createUser";
import GenerateAccessToken from "./generateAccessToken";
import InsertToken from "./insertToken";
import MedicalRecordsAccess from "./medicalRecordsAccess";
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
                <Route path="/medical-records" element={user && user.userType === 'Patient' ? <MedicalRecords /> : <Navigate to="/" replace />} />
                <Route path="/generate-access-token" element={user && user.userType === 'Patient' ? <GenerateAccessToken /> : <Navigate to="/" replace />} />
                <Route path="/insert-token" element={user && user.userType === 'Doctor' ? <InsertToken /> : <Navigate to="/" replace />} />
                <Route path="/medical-records-access" element={user && user.userType === 'Doctor' && patient ? <MedicalRecordsAccess />: <Navigate to="/" replace />} />
            </Routes>
        </main>
    );
};
export default Main;
