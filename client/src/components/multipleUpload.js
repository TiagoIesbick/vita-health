
import { useEffect, useRef, useState } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import { supportedFileFormats } from '../utils/utils';
import FileRenderer from './fileRenderer';
import './multipleUpload.css';


const MultipleUpload = ({ formik }) => {
    const [totalSize, setTotalSize] = useState(0);
    const fileUploadRef = useRef(null);

    const onTemplateSelect = (e) => {
        let _totalSize = 0;
        let files = e.files;

        Object.keys(files).forEach((key) => {
            _totalSize += files[key].size || 0;
        });

        formik.setFieldTouched("files", true);
        formik.setFieldValue("files", files);

        setTotalSize(_totalSize);
    };

    const onTemplateRemove = (file, callback) => {
        setTotalSize(totalSize - file.size);
        let files = formik.values.files;
        files = files.filter(f => f !== file )
        formik.setFieldValue("files", files);
        callback();
    };

    const onTemplateClear = () => {
        setTotalSize(0);
        formik.setFieldValue("files", []);
    };

    useEffect(() => {
        if (formik.status?.success) {
            fileUploadRef.current.clear();
            formik.setStatus(undefined);
            formik.resetForm();
        };

    },[formik]);

    const headerTemplate = (options) => {
        const { className, chooseButton, cancelButton } = options;
        const value = totalSize / (10 * 1024 * 1024) * 100;
        const formatedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

        return (
            <div className={className} style={{ backgroundColor: 'white', display: 'flex', alignItems: 'center', border: 'none' }}>
                {chooseButton}
                {cancelButton}
                <div className="flex align-items-center gap-3 ml-auto">
                    <span>{formatedValue} / 10 MB</span>
                    <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
                </div>
            </div>
        );
    };

    const itemTemplate = (file, props) => {
        return (
            <div className="flex align-items-center flex-wrap">
                <div className="flex align-items-center" style={{ width: '40%' }}>
                    <FileRenderer
                        file={{ url: file.objectURL, mimeType: file.type, fileName: file.name }}
                        style={{
                            width: '5rem',
                            height: '5rem',
                            objectFit: file.type !== "application/pdf" ? 'cover' : undefined
                        }}
                        fallback={
                            <i className="pi pi-file-pdf text-red-500" style={{ fontSize: '5rem' }}></i>
                        }
                        preview={true}
                    />
                    <span className="flex-column text-left ml-3 visible-description">
                        {file.name.length > 10 ? file.name.slice(0, 10) + ' ...' : file.name}
                        <small>{new Date().toLocaleDateString()}</small>
                    </span>
                </div>
                <Tag value={props.formatSize} severity="warning" className="px-3 py-2 visible-tag" />
                <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger ml-auto" onClick={() => onTemplateRemove(file, props.onRemove)} />
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i className="pi pi-file-arrow-up mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
                    Drag and Drop Files Here
                </span>
            </div>
        );
    };

    const chooseOptions = { icon: 'pi pi-fw pi-file-arrow-up', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
    const cancelOptions = { icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined' };

    return (
        <div>
            <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
            <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

            <FileUpload ref={fileUploadRef} name="files" url="/uploads" multiple accept={supportedFileFormats} maxFileSize={2 * 1024 * 1024}
                onSelect={onTemplateSelect} onError={onTemplateClear} onClear={onTemplateClear}
                headerTemplate={headerTemplate} itemTemplate={itemTemplate} emptyTemplate={emptyTemplate}
                chooseOptions={chooseOptions} cancelOptions={cancelOptions}
            />
            {formik.touched.files && formik.errors.files && <div className="text-red-500 text-xs">{formik.errors.files}</div>}
        </div>
    );
};
export default MultipleUpload;