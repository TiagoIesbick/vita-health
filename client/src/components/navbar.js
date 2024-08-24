import { Link } from "react-router-dom";
import { useUser } from "../providers/userContext";
import UserBar from "./userBar";

const Navbar = () => {
    const { user, patient } = useUser();
    return (
        <nav>
            <ul className="flex flex-row justify-content-around align-items-center p-0" style={{listStyle: "none"}}>
                {user && user.userType === 'Patient' &&
                    <>
                        <li><Link to="/medical-records">Medical Records</Link></li>
                        <li><Link to="/generate-access-token" >Generate Token</Link></li>
                    </>
                }
                {user && user.userType === 'Doctor' && <li><Link to="/insert-token">Insert Token</Link></li>}
                {user && user.userType === 'Doctor' && patient && <li><Link to="/medical-records-access">Patient Medical Records</Link></li>}
                {!user &&
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/create-user">Register</Link></li>
                    </>
                }
                {user && <li><UserBar /></li>}
            </ul>
        </nav>
    );
};
export default Navbar;