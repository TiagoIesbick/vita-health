import Home from "./home";
import MedicalRecords from "./medicalRecords";
import Login from "./login";
import CreateUser from "./createUser";
import { Routes, Route, Navigate } from "react-router-dom";

const Main = () => {
    return (
        <main>
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
