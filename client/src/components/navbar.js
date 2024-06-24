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
                        <li><Link to="/medical-records" className="underline-move">Dados Médicos</Link></li>
                        <li><Link to="/generate-access-token" className="underline-move">Gerar Token de Acesso</Link></li>
                    </>
                }
                {user && user.userType === 'Doctor' && <li><Link to="/insert-token" className="underline-move">Inserir Token</Link></li>}
                {user && user.userType === 'Doctor' && patient && <li><Link to="/medical-records-access" className="underline-move">Dados do Paciente</Link></li>}
                {!user && <li><Link to="/login" className="underline-move">Login</Link></li>}
                {user && <li><UserBar /></li>}
            </ul>
        </nav>
    );
};
export default Navbar;