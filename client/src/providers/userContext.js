import { createContext, useContext, useRef, useState } from "react";
import { getCredentials } from "../graphql/auth";

const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [ user, setUser ] = useState(getCredentials());
    const toast = useRef(null);
    const showMessage = (severity, summary, detail, sticky=false) => {
        toast.current.show({ severity, summary, detail, sticky });
    };

    return (
        <UserContext.Provider value={{user, setUser, toast, showMessage}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
