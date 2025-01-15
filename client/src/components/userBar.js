import { Menu } from 'primereact/menu';
import { Avatar } from 'primereact/avatar';
import { useRef } from 'react';
import { logout } from "../graphql/auth";
import { useNavigate } from "react-router-dom";
import { useUser } from "../providers/userContext";
import { useLanguage } from "../providers/languageContext";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';


const UserBar = () => {
    const navigate = useNavigate();
    const { translations } = useLanguage();
    const { user, setUser, setPatient, showMessage } = useUser();
    const userMenu = useRef(null);
    const items = [
        ...(user.userType === 'Patient' ? [{
            label: translations?.insertMedicalRecord?.title,
            icon: 'pi pi-plus-circle',
            command: () => navigate("/insert-medical-record")
        }] : []),
        {
            label: translations?.activeTokens?.title,
            icon: 'pi pi-ticket',
            command: () => navigate("/active-tokens")
        },
        ...(user.userType === 'Doctor' ? [{
            label: translations?.patients?.title,
            icon: <FontAwesomeIcon icon={faUsers} className='mr-2 text-color-secondary pi w-1rem'/>,
            command: () => navigate("/patients")
        }] : []),
        ...(user.userType === 'Patient' ? [{
            label: translations?.inactiveTokens?.title,
            icon: 'pi pi-eye-slash',
            command: () => navigate("/inactive-tokens")
        }] : []),
        {
            label: translations?.editProfile?.title,
            icon: 'pi pi-user-edit',
            command: () => navigate("/edit-profile")
        },
        {
            separator: true
        },
        {
            label: translations?.userbar?.logout,
            icon: 'pi pi-sign-out',
            command: () => {
                logout();
                showMessage('info', translations?.userbar?.loggedOut, `${translations?.userbar?.bye} ${user.firstName} 👋`);
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
