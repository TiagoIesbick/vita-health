import { Skeleton } from 'primereact/skeleton';
import './loadingMedicalRecordsSkeleton.css';


const LoadingMedicalRecordsSkeleton = () => {
    return (
        <>
            <div className="flex w-full skeleton-justify-content my-2">
                <div className="flex skeleton-width">
                    <Skeleton shape="circle" size="2rem"></Skeleton>
                    <Skeleton height="10rem" className="mx-3 w-full"></Skeleton>
                </div>
            </div>
            <div className="flex w-full">
                <div className="flex skeleton-width skeleton-reverse-row">
                    <Skeleton height="10rem" className="mx-3 w-full"></Skeleton>
                    <Skeleton shape="circle" size="2rem"></Skeleton>
                </div>
            </div>
        </>
    )
};
export default LoadingMedicalRecordsSkeleton;