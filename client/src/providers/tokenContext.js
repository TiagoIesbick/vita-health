import { createContext, useContext, useState } from 'react';


const TokenContext = createContext();


export const TokenProvider = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [tokenId, setTokenId] = useState(0);

    return (
        <TokenContext.Provider value={{ visible, setVisible, tokenId, setTokenId }}>
            {children}
        </TokenContext.Provider>
    );
};


export const useTokenContext = () => useContext(TokenContext);