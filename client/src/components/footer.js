import { motion } from "framer-motion"
import { Link } from "react-router-dom";
import logo from "../assets/logos/logo-vita-no-bg.png";

const Footer = () => {
    return (
        <footer className="flex justify-content-center align-items-center m-2">
            <Link to="/"><motion.img src={logo} alt="logo" style={{width: 48}} whileHover={{scale: 1.2}} /></Link>
            <p>Você no controle da sua saúde</p>
        </footer>
    );
};
export default Footer;