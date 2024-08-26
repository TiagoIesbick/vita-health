import Navbar from "./navbar";
import logo from "../assets/logos/logo-vita-no-bg.png";
import './header.css';
import { Link } from "react-router-dom";
import { motion } from "framer-motion"

const Header = () => {
    return (
        <header className="h-5rem">
            <Link to="/"><motion.img src={logo} alt="logo" style={{width: 48}} whileHover={{scale: 1.2}} /></Link>
            <Navbar />
        </header>
    );
};
export default Header;