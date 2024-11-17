import { Card } from "primereact/card";
import { BASE_URL_SERVER } from "../graphql/apolloConfig";
import { Link } from "react-router-dom";
import FileRenderer from "./fileRenderer";


const FileItem = ({ file, fileHeight, fileWidth }) => {
    return (
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
};
export default FileItem;