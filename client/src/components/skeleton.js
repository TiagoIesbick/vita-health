import { Skeleton } from 'primereact/skeleton';
import { Card } from "primereact/card";

const LoadingSkeleton = () => {
    return (
        <Card className='card-min-height'>
            <Skeleton width="50%" className="mb-3 h-2rem"></Skeleton>
            <Skeleton className="w-full mb-3" height="calc(50dvh - 9.5rem)"></Skeleton>
            <Skeleton width="w-full" height="calc(50dvh - 9.5rem)"></Skeleton>
        </Card>
    );
};
export default LoadingSkeleton;