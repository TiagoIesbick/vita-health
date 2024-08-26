import { Skeleton } from 'primereact/skeleton';
import { Card } from "primereact/card";

const LoadingSkeleton = () => {
    return (
        <Card className='card-min-height'>
            <Skeleton width="100%" height="calc(100dvh - 15rem)"></Skeleton>
        </Card>
    );
};
export default LoadingSkeleton;