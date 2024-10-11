import { BASE_URL_SERVER } from "../graphql/apolloConfig";

const ObjectFile = ({ file, style, fallback }) => {

    return (
        <object
            data={BASE_URL_SERVER + file.url + '#zoom=page-width'}
            type={file.mimeType}
            aria-label="PDF file"
            title={file.fileName}
            style={style}
        >
            <>{fallback}</>
        </object>
    );
};
export default ObjectFile;