import { Link } from "react-router-dom";
import { useUser } from "../providers/userContext";
import UserBar from "./userBar";
import './navbar.css';


const Navbar = () => {
    const { user, patient } = useUser();
    return (
        <nav>
            {user &&
                <>
                <ul className="flex flex-row justify-content-evenly align-items-center p-0" style={{gridColumn: "1 / span 8"}}>
                    {user.userType === 'Patient' &&
                        <>
                            <li className="nav-button"><Link to="/medical-records">History</Link></li>
                            <li className="nav-button"><Link to="/generate-access-token">Token</Link></li>
                        </>
                    }
                    {user.userType === 'Doctor' && <li className="nav-button"><Link to="/insert-token">Token</Link></li>}
                    {user && user.userType === 'Doctor' && patient && <li className="nav-button"><Link to="/medical-records-access">History</Link></li>}
                </ul>
                <UserBar />
                </>
            }
            {!user &&
                <ul className="flex flex-row align-items-center justify-content-end gap-2 p-0" style={{gridColumn: "1 / span 9"}}>
                    <li className="btn-nav"><Link to="/login" >Login</Link></li>
                    <li className="btn-nav"><Link to="/sign-up" >Sign up</Link></li>
                </ul>
            }
        </nav>
    );
};
export default Navbar;