import Navbar from "./navbar";
import logo from "../assets/logos/logo-vita-no-bg.png";

const Header = () => {
    return (
        <header>
            <img src={logo} alt="logo" style={{width: 48}} />
            <Navbar />
        </header>
    );
};
export default Header;