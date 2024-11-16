import { createContext, useContext, useState } from 'react';


const FileContext = createContext();


export const FileProvider = ({ children }) => {
    const [fileVisible, setFileVisible] = useState(false);
    const [file, setFile] = useState([]);
    const fileHeight = 'calc(100vh - (100vh/6))';
    const fileWidth = 'calc(100vw - (100vw/6))';

    return (
        <FileContext.Provider
            value={{
                fileVisible, setFileVisible, file, setFile,
                fileHeight, fileWidth
            }}
        >
            {children}
        </FileContext.Provider>
    );
};


export const useFileContext = () => useContext(FileContext);