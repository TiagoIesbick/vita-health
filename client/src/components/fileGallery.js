import { Galleria } from 'primereact/galleria';
import { Card } from "primereact/card";
import { Link } from "react-router-dom";
import { BASE_URL_SERVER } from "../graphql/apolloConfig";
import { useEffect, useRef, useState } from "react";
import FileRenderer from './fileRenderer';


const FileGallery = ({ files, layout='grid', show, setShow=()=>{} }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const galleria = useRef(null);

    useEffect(() => {
        if (show) galleria.current.show();
    },[show]);

    const fileHeight = layout === 'grid'
        ? 'calc(100vh - (100vh/6))'
        : 'calc(100vh - (100vh/6) - 116px)';

    const fileWidth = 'calc(100vw - (100vw/6))';

    const itemTemplate = (file) => (
        <FileRenderer
            file={file}
            style={{
                height: file.mimeType !== "application/pdf" ? undefined: fileHeight,
                width: file.mimeType !== "application/pdf" ? undefined: fileWidth,
                objectFit: file.mimeType !== "application/pdf" ? 'cover' : undefined,
                maxHeight: file.mimeType !== "application/pdf" ? fileHeight: undefined,
                maxWidth: file.mimeType !== "application/pdf" ? fileWidth : undefined,
            }}
            fallback={
                <div className='flex align-items-center h-full justify-content-center mx-4'>
                    <Card className='text-center text-white' style={{background: 'linear-gradient(45deg, darkblue, darkorchid)'}}>
                        <p className='mt-0'>Your browser does not support viewing this file.</p>
                        <Link to={BASE_URL_SERVER + file.url} target="_blank" className='text-white underline'>Download the file here</Link>
                    </Card>
                </div>
            }
        />
    );

    const thumbnailTemplate = (file) => (
        <div className="relative w-full h-full">
            <FileRenderer
                file={file}
                style={{
                    height: '5rem',
                    width: '5rem',
                    objectFit: file.mimeType !== "application/pdf" ? 'cover' : undefined
                }}
                fallback={<i className="pi pi-file-pdf text-red-500" style={{ fontSize: '5rem' }}></i>}
            />
            <div className="absolute top-0 left-0 w-full h-full cursor-pointer"></div>
        </div>
    );

    const responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 5
        },
        {
            breakpoint: '960px',
            numVisible: 4
        },
        {
            breakpoint: '768px',
            numVisible: 3
        },
        {
            breakpoint: '560px',
            numVisible: 1
        }
    ];

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
                responsiveOptions={responsiveOptions}
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
                    {files && files.map((file, index) => (
                        <div className="col-3" key={index}>
                            <div className="relative w-5rem h-5rem" onClick={() => handleClick(index)}>
                                <FileRenderer
                                    file={file}
                                    style={{
                                        height: '5rem',
                                        width: '5rem',
                                        objectFit: file.mimeType !== "application/pdf" ? 'cover' : undefined
                                    }}
                                    fallback={<i className="pi pi-file-pdf text-red-500" style={{ fontSize: '5rem' }}></i>}
                                />
                                <div className="absolute top-0 left-0 w-full h-full cursor-pointer"></div>
                            </div>
                        </div>
                    ))}
                </div>
            }
        </>
    );
};
export default FileGallery;