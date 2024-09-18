import { Card } from "primereact/card";
import { useInactiveTokens } from "../hooks/hooks";
import LoadingSkeleton from "../components/skeleton";


const InactiveTokens = () => {
    const { inactiveTokens, loadingInactiveTokens, errorInactiveTokens } = useInactiveTokens(3,3);
    console.log('[InactiveTokens]', inactiveTokens);
    if (loadingInactiveTokens) return <LoadingSkeleton />;
    return (
        <Card title="Inactive Tokens" className="flex justify-content-center align-items-center card-min-height">
            <p>Inactive TOkens</p>
        </Card>
    );
};
export default InactiveTokens;