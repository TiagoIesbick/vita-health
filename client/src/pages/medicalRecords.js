import { Card } from "primereact/card";
import { Timeline } from 'primereact/timeline';
import { classNames } from 'primereact/utils';
import { useUser } from "../providers/userContext";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router';
import { useCallback, useEffect, useRef, useState } from "react";
import { useMedicalRecords } from "../hooks/hooks";
import { customizedContent, customizedMarker } from "../utils/utils";
import LoadingSkeleton from "../components/skeleton";
import './medicalRecords.css';


const limit = 10;

const MedicalRecords = () => {
    const navigate = useNavigate();
    const { showMessage } = useUser();
    const [offset, setOffset] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [allRecords, setAllRecords] = useState([]);
    const { medicalRecords, loading, error } = useMedicalRecords(limit, offset);
    const loader = useRef(null);

    useEffect(() => {
        return () => {
            setOffset(0);
            setAllRecords([]);
            setIsLoadingMore(false);
        };
    }, []);

    useEffect(() => {
        if (medicalRecords?.items) {
            setAllRecords((prevRecords) => [...prevRecords, ...medicalRecords.items]);
            setIsLoadingMore(false);
        }
    }, [medicalRecords]);

    const observerCallback = useCallback(
        (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && !loading && !isLoadingMore && medicalRecords?.items?.length > 0) {
                setIsLoadingMore(true);
                setOffset((prevOffset) => prevOffset + limit);
            }
        },
        [loading, isLoadingMore, medicalRecords]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(observerCallback, { threshold: 1.0 });
        if (loader.current) observer.observe(loader.current);
        return () => observer.disconnect();
    }, [observerCallback]);


    if (loading && !isLoadingMore) {
        return <LoadingSkeleton />
    };

    if (error) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <Card
            title="Health History"
            className="flex justify-content-center align-items-center card-min-height medical-record"
        >
            {allRecords.length === 0 ?
                <>
                    <p>You have no health history yet.</p>
                    <p>Start by adding your health data <Link to="/insert-medical-record" >here</Link> to begin building your records.</p>
                    <p>Alternatively, generate a token <Link to="/generate-access-token" >here</Link> to share with your health professional so they can add new information.</p>
                </> :
                <Timeline value={allRecords} align="alternate" className="customized-timeline" marker={customizedMarker} content={customizedContent} />
            }
            <div ref={loader} className={classNames("flex justify-content-center align-items-center", { 'max-h-0': medicalRecords?.totalCount === 0, 'h-2rem': medicalRecords?.totalCount !== 0} )} >
                {isLoadingMore && <LoadingSkeleton />}
            </div>
        </Card>
    );
};
export default MedicalRecords;
