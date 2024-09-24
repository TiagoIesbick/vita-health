import { useState } from "react";
import { Button } from 'primereact/button';


const CopyButton = ({ txt }) => {
    const [copied, setCopied] = useState(false);

    return (
        <Button
            icon={copied ? "pi pi-check": "pi pi-copy"}
            severity={copied ? "success": "primary"}
            text
            aria-label="copy"
            rounded
            onClick={() => {
                navigator.clipboard.writeText(txt);
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
            }}
        ></Button>
    );
};
export default CopyButton;
