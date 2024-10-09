import { Galleria } from 'primereact/galleria';
import { BASE_URL_SERVER } from "../graphql/apolloConfig";
import { useEffect, useRef, useState } from "react";


const FileGallery = ({ files, layout='grid', show, setShow=()=>{}}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const galleria = useRef(null);

    useEffect(() => {
        if (show) galleria.current.show();
    },[show]);

    const itemTemplate = (file) => {
        return file.mimeType === "application/pdf"
            ? <iframe
                src={BASE_URL_SERVER + file.url + '#zoom=page-width'}
                style={{
                    height: 'calc(100vh - (100vh/6))',
                    width: 'calc(100vw - (100vw/6))'
                }}
                aria-label="PDF file"
                title={file.fileName}
             />
            : <img
                src={BASE_URL_SERVER + file.url}
                alt={file.fileName}
                style={{
                    objectFit: 'cover',
                    maxHeight: 'calc(100vh - (100vh/6))',
                    maxWidth: 'calc(100vw - (100vw/6))'
                }}
             />;
    };

    const thumbnailTemplate = (file) => {
        return file.mimeType === "application/pdf"
            ? <iframe
                src={BASE_URL_SERVER + file.url + '#zoom=page-width'}
                style={{
                    height: '100px',
                    width: '100px'
                }}
                aria-label="PDF file"
                title={file.fileName}
             />
            : <img
                src={BASE_URL_SERVER + file.url}
                alt={file.fileName}
                style={{
                    objectFit: 'cover',
                    height: '100px',
                    maxWidth: '100px'
                }}
             />;
    };

    const handleClick = (index) => {
        setActiveIndex(index);
        galleria.current.show()
    };

    return (
        <>
            <Galleria
                ref={galleria}
                value={files}
                numVisible={7}
                activeIndex={activeIndex}
                onItemChange={(e) => setActiveIndex(e.index)}
                circular
                fullScreen
                showItemNavigators
                showThumbnails={layout === 'grid' ? false : true}
                item={itemTemplate}
                thumbnail={thumbnailTemplate}
                onHide={() => setShow(false)}
            />
            {layout === 'grid' &&
            <div className="grid m-auto align-items-center mt-3" style={{ maxWidth: '400px' }} hidden={files.length < 1}>
                {
                    files && files.map((file, index) => {
                        let fileEl = file.mimeType === "application/pdf"
                            ? <div className="relative w-full h-5rem" onClick={() => handleClick(index)}>
                                <iframe
                                    src={BASE_URL_SERVER + file.url}
                                    className="w-full h-full flex"
                                    aria-label="PDF file"
                                    title={file.fileName}
                                />
                                <div className="absolute top-0 left-0 w-full h-full cursor-pointer"></div>
                              </div>
                            : <img
                                src={BASE_URL_SERVER + file.url}
                                className="w-full h-5rem"
                                alt={file.fileName}
                                style={{objectFit: 'cover', cursor: 'pointer'}}
                                onClick={() => handleClick(index)}
                              />;

                        return (
                            <div className="col-3" key={index}>
                                {fileEl}
                            </div>
                        );
                    })
                }
            </div>
            }
        </>
    );
};
export default FileGallery;