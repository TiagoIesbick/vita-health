import { Card } from "primereact/card";
import { localDateTime, stripHtmlTags } from "../utils/utils";
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Link } from "react-router-dom";
import { classNames } from "primereact/utils";
import { useState } from "react";
import FileGallery from "./fileGallery";


const HealthDataContent = ({item}) => {
    const [show, setShow] = useState(false);
    let date = localDateTime(item.dateCreated, 'minus');
    const filesLength = item.files.length;
    const cleanText = stripHtmlTags(item.recordData);
    const textSlice = cleanText.length > 100 ? cleanText.slice(0, 100) + ' ...' : cleanText;

    return (
        <Card
            title={item.recordType.recordName}
            subTitle={
                `${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`
            }
        >
            <p className="mt-0">{textSlice}</p>
            <div
                className={
                    classNames("health-data-buttons", {
                        "block": filesLength === 0,
                        "flex": filesLength > 0,
                        "justify-content-between": filesLength > 0,
                        "flex-wrap": filesLength > 0
                    })
                }
            >
                {filesLength > 0 &&
                    <>
                        <Button rounded text onClick={() => setShow(true)} >
                            <i className="pi pi-paperclip p-overlay-badge">
                                <Badge className="bg-primary-100 text-primary text-xs p-0" value={item.files.length} />
                            </i>
                        </Button>
                        <FileGallery files={item.files} layout={'thumbnail'} show={show} setShow={setShow} />
                    </>
                }
                <Link to={`/medical-record/${item.recordId}`}><Button label="Read more" outlined></Button></Link>
            </div>
        </Card>
    );
};
export default HealthDataContent;