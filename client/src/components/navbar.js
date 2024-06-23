import { Link } from "react-router-dom";
import { useUser } from "../providers/userContext";
import UserBar from "./userBar";

const Navbar = () => {
    const { user } = useUser();
    return (
        <nav>
            <ul className="flex flex-row justify-content-around align-items-center p-0" style={{listStyle: "none"}}>
                <li><Link to="/">Home</Link></li>
                {user && user.userType === 'Patient' &&
                    <>
                        <li><Link to="/medical-records">Dados Médicos</Link></li>
                        <li><Link to="/generate-access-token">Gerar Token de Acesso</Link></li>
                    </>
                }
                {user && user.userType === 'Doctor' && <li><Link to="/insert-token">Inserir Token</Link></li>}
                {!user && <li><Link to="/login">Login</Link></li>}
                {user && <li><UserBar /></li>}
            </ul>
        </nav>
    );
};
export default Navbar;