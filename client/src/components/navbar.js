import { Link } from "react-router-dom";
import { useUser } from "../providers/userContext";
import UserBar from "./userBar";
import './navbar.css';


const Navbar = () => {
    const { user, patient } = useUser();
    return (
        <nav>
            {user &&
                <ul className="flex flex-row justify-content-around align-items-center p-0" style={{listStyle: "none"}}>
                    {user.userType === 'Patient' &&
                        <>
                            <li className="btn-nav"><Link to="/medical-records">History</Link></li>
                            <li className="btn-nav"><Link to="/generate-access-token">Token</Link></li>
                        </>
                    }
                    {user.userType === 'Doctor' && <li><Link to="/insert-token">Token</Link></li>}
                    {user && user.userType === 'Doctor' && patient && <li><Link to="/medical-records-access">History</Link></li>}
                    <li><UserBar /></li>
                </ul>
            }
            {!user &&
                <ul className="flex flex-row align-items-center justify-content-end gap-2">
                    <li className="btn-nav"><Link to="/login" >Login</Link></li>
                    <li className="btn-nav"><Link to="/sign-up" >Sign up</Link></li>
                </ul>
            }
        </nav>
    );
};
export default Navbar;