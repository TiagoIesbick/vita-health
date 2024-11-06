import { Galleria } from 'primereact/galleria';
import { useEffect, useRef, useState } from "react";
import FileRenderer from './fileRenderer';
import FileItem from './fileItem';


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
                item={(file) => (
                    <FileItem
                        file={file}
                        fileHeight={fileHeight}
                        fileWidth={fileWidth}
                    />
                )}
                thumbnail={thumbnailTemplate}
                onHide={() => setShow(false)}
            />
            {layout === 'grid' &&
                <div className="grid gap-3 m-auto justify-content-center align-items-center mt-3" style={{ maxWidth: '400px' }} hidden={files.length < 1}>
                    {files && files.map((file, index) => (
                        <div key={index}>
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