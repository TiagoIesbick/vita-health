import { Link } from "react-router-dom";
import { useUser } from "../providers/userContext";
import UserBar from "./userBar";
import './navbar.css';

const Navbar = () => {
    const { user, patient } = useUser();
    return (
        <nav>
            <ul className="flex flex-row justify-content-around align-items-center p-0" style={{listStyle: "none"}}>
                {user && user.userType === 'Patient' &&
                    <>
                        <li><Link to="/medical-records" className="underline-move">Medical Records</Link></li>
                        <li><Link to="/generate-access-token" className="underline-move">Generate Token</Link></li>
                    </>
                }
                {user && user.userType === 'Doctor' && <li><Link to="/insert-token" className="underline-move">Insert Token</Link></li>}
                {user && user.userType === 'Doctor' && patient && <li><Link to="/medical-records-access" className="underline-move">Patient Medical Records</Link></li>}
                {!user && <li><Link to="/login" className="underline-move">Login</Link></li>}
                {user && <li><UserBar /></li>}
            </ul>
        </nav>
    );
};
export default Navbar;