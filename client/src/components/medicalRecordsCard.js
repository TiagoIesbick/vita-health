import { Card } from "primereact/card";
import { Timeline } from "primereact/timeline";
import { classNames } from "primereact/utils";
import { ScrollTop } from 'primereact/scrolltop';
import { customizedContent, customizedMarker } from "../utils/utils";
import LoadingMedicalRecordsSkeleton from "./loadingMedicalRecordsSkeleton";
import './medicalRecordsCard.css';


const MedicalRecordsCard = ({
    title, allRecords, medicalRecords, loading, loader, emptyMessage, children
}) => {

    return (
        <Card
            title={title}
            className="flex justify-content-center align-items-center card-min-height medical-record"
        >
            {children}
            {!loading && allRecords.length === 0
                ?   <>{emptyMessage}</>
                :   <>
                        <Timeline
                            value={allRecords}
                            align="alternate"
                            className="customized-timeline"
                            marker={customizedMarker}
                            content={customizedContent}
                        />
                        <ScrollTop
                            threshold={100}
                            className="w-2rem h-2rem border-round bg-primary"
                            icon="pi pi-arrow-up text-base"
                        />
                    </>
            }
            <div
                ref={loader}
                className={
                    classNames("h-2rem justify-content-center align-items-center", {
                        "hidden": allRecords.length === medicalRecords?.totalCount,
                        "flex": allRecords.length < medicalRecords?.totalCount
                    })
                }
            />
            {loading && <LoadingMedicalRecordsSkeleton />}
        </Card>
    );
};
export default MedicalRecordsCard;
