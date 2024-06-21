import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav>
            <ul className="flex flex-row justify-content-around align-items-center p-0" style={{listStyle: "none"}}>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/medical-records">Medical Records</Link></li>
                <li><Link to="/login">Login</Link></li>
            </ul>
        </nav>
    );
};
export default Navbar;