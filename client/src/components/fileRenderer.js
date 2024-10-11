import { BASE_URL_SERVER } from "../graphql/apolloConfig";

const FileRenderer = ({ file, style, fallback, preview = false }) => {
    const isPDF = file.mimeType === "application/pdf";

    return isPDF ? (
        <object
            data={!preview ? BASE_URL_SERVER + file.url + '#zoom=page-width' : file.url}
            type={file.mimeType}
            aria-label="PDF file"
            title={file.fileName}
            style={style}
        >
            <>{fallback}</>
        </object>
    ) : (
        <img
            src={!preview ? BASE_URL_SERVER + file.url : file.url}
            alt={file.fileName}
            style={style}
        />
    );
};
export default FileRenderer;
