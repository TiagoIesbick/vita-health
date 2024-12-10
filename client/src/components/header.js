import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "../providers/userContext";
import { useState, useEffect } from "react";
import Search from "./search";
import Navbar from "./navbar";
import LocalLanguage from "./localLanguage";
import logo from "../assets/logos/logo-vita-no-bg.png";
import './header.css';


const Header = () => {
    const { user, patient } = useUser();
    const [visible, setVisible] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        if ((user && user.userType === 'Patient') ||
            (user && user.userType === 'Doctor' && patient)) {
            setVisible(true);
        } else { setVisible(false); }
    },[user, patient]);

    useEffect(() => {
        const resizeListener = () => {
            setScreenWidth(window.innerWidth);
            if (expanded && window.innerWidth <= 600) setExpanded(false);
        }
        window.addEventListener('resize', resizeListener);
        return () => window.removeEventListener('resize', resizeListener);
    }, [expanded, setExpanded, setScreenWidth]);

    return (
        <header className="h-5rem">
            <Link to="/" className="max-w-max">
                <motion.img
                    src={logo}
                    alt="logo"
                    style={{ width: 48 }}
                    whileHover={{scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
            </Link>
            <div
                className="flex align-items-center"
                style={{
                    width: !expanded && screenWidth <= 600 ? undefined : '100%',
                    maxWidth: !expanded && screenWidth <= 600 ? undefined : '300px'
                }}
            >
                <LocalLanguage expanded={expanded} screenWidth={screenWidth} />
                {visible && <Search expanded={expanded} setExpanded={setExpanded} screenWidth={screenWidth} />}
            </div>
            <Navbar expanded={expanded} />
        </header>
    );
};
export default Header;