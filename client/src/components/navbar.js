import { classNames } from 'primereact/utils';
import { Link } from "react-router-dom";
import { useUser } from "../providers/userContext";
import { useLanguage } from "../providers/languageContext";
import UserBar from "./userBar";
import './navbar.css';


const Navbar = ({ expanded }) => {
    const { user, patient } = useUser();
    const { translations } = useLanguage();

    return (
        <nav
            className='w-full'
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(9, 1fr)'
            }}
        >
            {user &&
                <>
                <ul className={
                        classNames("flex-row justify-content-evenly align-items-center p-0", {
                            'flex': !expanded, 'hidden': expanded
                    })}
                    style={{gridColumn: "1 / span 8"}}
                >
                    {user.userType === 'Patient' &&
                        <>
                            <li><Link className="nav-button" to="/medical-records">{translations?.navbar?.history}</Link></li>
                            <li><Link className="nav-button" to="/generate-access-token">Token</Link></li>
                        </>
                    }
                    {user.userType === 'Doctor' && <li className="nav-button"><Link to="/insert-token">Token</Link></li>}
                    {user && user.userType === 'Doctor' && patient && <li className="nav-button"><Link to="/medical-records-access">{translations?.navbar?.history}</Link></li>}
                </ul>
                <UserBar />
                </>
            }
            {!user &&
                <ul className="flex flex-row align-items-center justify-content-end gap-2 p-0" style={{gridColumn: "1 / span 9"}}>
                    <li><Link className='btn-nav' to="/login" >{translations?.navbar?.login}</Link></li>
                    <li><Link className="btn-nav" to="/sign-up" >{translations?.navbar?.signUp}</Link></li>
                </ul>
            }
        </nav>
    );
};
export default Navbar;