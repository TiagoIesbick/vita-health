import { Card } from "primereact/card";
import { localDateTime, stripHtmlTags } from "../utils/utils";
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Link } from "react-router-dom";
import FileGallery from "./fileGallery";
import { useState } from "react";


const HealthDataContent = ({item}) => {
    const [show, setShow] = useState(false);
    let date = localDateTime(item.dateCreated, 'minus');
    const filesLength = item.files.length;
    const cleanText = stripHtmlTags(item.recordData);
    const textSlice = cleanText.length > 100 ? cleanText.slice(0, 100) + ' ...' : cleanText;

    return (
        <Card title={item.recordType.recordName} subTitle={`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}>
            <p className="mt-0">{textSlice}</p>
            {filesLength > 0 &&
                <>
                    <Button rounded text onClick={() => setShow(true)}>
                        <i className="pi pi-paperclip p-overlay-badge mb-3 mt-2">
                            <Badge className="bg-primary-100 text-primary text-xs p-0" value={item.files.length} />
                        </i>
                    </Button>
                    <FileGallery files={item.files} layout={'thumbnail'} show={show} setShow={setShow} />
                </>
            }
            <Link to={`/medical-record/${item.recordId}`}><Button label="Read more" outlined></Button></Link>
        </Card>
    );
};
export default HealthDataContent;