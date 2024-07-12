import { useActiveTokens } from "../hooks/hooks";
import { Card } from "primereact/card";


const ActiveTokens = () => {
    const { activeTokens, loading, error } = useActiveTokens();
    if (loading) {
        return <div>Loading...</div>
    };
    if (error) {
        return <div>Data Unavailable</div>
    };
    return (
        <Card
            title="Active Tokens"
            className="flex justify-content-center align-items-center"
            style={{minHeight: 'calc(100vh - 128px)'}}
        >
            <pre>
                {JSON.stringify(activeTokens, undefined, 2)}
            </pre>
        </Card>
    );
};
export default ActiveTokens;
