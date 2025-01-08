import { Card } from "primereact/card";
import { localDateTime, stripHtmlTags } from "../utils/utils";
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Link } from "react-router-dom";
import { classNames } from "primereact/utils";
import { useState } from "react";
import { useLanguage } from "../providers/languageContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserDoctor } from '@fortawesome/free-solid-svg-icons';
import FileGallery from "./fileGallery";


const HealthDataContent = ({item}) => {
    const { language, translations } = useLanguage();
    const [show, setShow] = useState(false);
    let date = localDateTime(item.dateCreated, 'minus');
    const filesLength = item.files.length;
    const cleanText = stripHtmlTags(item.recordData);
    const textSlice = cleanText.length > 100 ? cleanText.slice(0, 100) + ' ...' : cleanText;

    const translation = item.recordType.translation?.find(
        (t) => t.languageCode === language
    );

    return (
        <Card
            title={translation ? translation.translatedName : item.recordType.recordName}
            subTitle={
                <>
                    {`${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`}
                    {item.doctor &&
                        <div className="flex gap-1 mt-1 align-items-baseline doctor-full-name">
                            <FontAwesomeIcon icon={faUserDoctor} />
                            {item.doctor.user.firstName + ' ' + item.doctor.user.lastName}
                        </div>
                    }
                </>
            }
        >
            <p className="mt-0 mb-4">{textSlice}</p>
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
                <Link to={`/medical-record/${item.recordId}`}><Button label={translations?.healthHistory?.readMore} outlined></Button></Link>
            </div>
        </Card>
    );
};
export default HealthDataContent;