import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../assets/logos/logo-vita-no-bg.png";

const Footer = () => {
    return (
        <footer className="flex flex-column justify-content-center align-items-center overflow-hidden h-5rem">
            <Link to="/">
                <motion.img
                    src={logo}
                    alt="logo"
                    style={{ width: 48 }}
                    whileHover={{scale: 1.1}}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
            </Link>
            <small>Copyright &copy; 2024</small>
        </footer>
    );
};
export default Footer;