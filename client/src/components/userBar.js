import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';
import { useRef } from 'react';
import { logout } from "../graphql/auth";
import { useNavigate } from "react-router-dom";
import { useUser } from "../providers/userContext";
import { motion } from "framer-motion";


const UserBar = () => {
    const navigate = useNavigate();
    const { user, setUser, setPatient, showMessage } = useUser();
    const userMenu = useRef(null);
    const items = [
        ...(user.userType === 'Patient' ? [{
            label: 'Add Health Data',
            icon: 'pi pi-plus-circle',
            command: () => navigate("/insert-medical-record")
        }] : []),
        {
            label: 'Active Tokens',
            icon: 'pi pi-ticket',
            command: () => navigate("/active-tokens")
        },
        ...(user.userType === 'Patient' ? [{
            label: 'Inactive Tokens',
            icon: 'pi pi-eye-slash',
            command: () => navigate("/inactive-tokens")
        }] : []),
        {
            label: 'Edit Profile',
            icon: 'pi pi-user-edit',
            command: () => navigate("/edit-profile")
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
                setPatient(null);
                navigate("/");
            }
        }
    ];

    return (
        <>
            <Menu model={items} popup ref={userMenu} />
            <motion.div
                className="align-self-center cursor-pointer"
                whileHover={{scale: 1.1}}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={(e) => userMenu?.current?.toggle(e)}
                style={{ gridColumn: '9', justifySelf: 'end' }}
            >
                <Avatar
                    label={user.firstName[0]}
                    shape="circle"
                    style={{
                        backgroundColor: 'var(--primary-100)',
                        color: 'var(--primary-500)',
                        boxShadow: '2px 4px 6px var(--primary-500)',
                        fontWeight: 'bold'
                    }}
                />
            </motion.div>
        </>
    );
};
export default UserBar;
