import Home from "./home";
import MedicalRecords from "./medicalRecords";
import Login from "./login";
import CreateUser from "./createUser";
import { Routes, Route } from "react-router-dom";
import { Toast } from 'primereact/toast';
import { useUser } from "../providers/userContext";


const Main = () => {
    const { toast } = useUser();
    return (
        <main>
            <Toast ref={toast} position="top-center" />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/create-user" element={<CreateUser />} />
                <Route path="/medical-records" element={<MedicalRecords />} />
            </Routes>
        </main>
    );
};
export default Main;
