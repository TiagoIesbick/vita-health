import { createContext, useContext, useRef, useState } from "react";
import { deleteCookie, getCredentials } from "../graphql/auth";
import { ACCESS_TOKEN_KEY, ACCESS_MEDICAL_TOKEN_KEY } from "../graphql/auth";

const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [ user, setUser ] = useState(getCredentials(ACCESS_TOKEN_KEY));
    const [ patient, setPatient] = useState(getCredentials(ACCESS_MEDICAL_TOKEN_KEY));
    const toast = useRef(null);
    const showMessage = (severity, summary, detail, sticky=false) => {
        toast.current.show({ severity, summary, detail, sticky });
    };
    if (patient && patient.exp <= Math.floor(Date.now() / 1000)) {
            setPatient(null);
            deleteCookie(ACCESS_MEDICAL_TOKEN_KEY);
    };

    return (
        <UserContext.Provider
            value={{
                user, setUser, patient, setPatient, toast, showMessage
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
