import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';
import { useRef } from 'react';
import { logout } from "../graphql/auth";
import { useNavigate } from "react-router-dom";
import { useUser } from "../providers/userContext";
import { motion } from "framer-motion"


const UserBar = () => {
    const navigate = useNavigate();
    const { user, setUser, showMessage } = useUser();
    const userMenu = useRef(null);
    const items = [
        {
            label: 'Edit Profile',
            icon: 'pi pi-user-edit',
            command: () => navigate("/edit-profile")
        },
        {
            label: 'Active Tokens',
            icon: 'pi pi-ticket',
            command: () => navigate("/active-tokens")
        },
        {
            separator: true
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => {
                logout();
                showMessage('info', 'Logged Out', `Bye ${user.firstName}`);
                setUser(null);
                navigate("/");
            }
        }
    ];

    return (
        <>
            <Menu model={items} popup ref={userMenu} />
            <motion.button
                className="p-link"
                whileHover={{scale: 1.2}}
                onClick={(e) => userMenu?.current?.toggle(e)}
            >
                <Avatar
                    label={user.firstName[0]}
                    shape="circle"
                />
            </motion.button>
        </>
    );
};
export default UserBar;
