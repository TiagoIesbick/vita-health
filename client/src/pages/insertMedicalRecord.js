import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from 'primereact/dropdown';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from 'primereact/button';
import { useFormik } from "formik";
import * as Yup from "yup";
import './insertMedicalRecord.css';
import { useRecordTypes } from "../hooks/hooks";
import { useEffect, useState } from "react";
import { Dialog } from 'primereact/dialog';
import { InputText } from "primereact/inputtext";


const TINYMCE_API_KEY = process.env.REACT_APP_TINYMCE_API_KEY;

const stripHtmlTags = (html) => html.replace(/<\/?[^>]+>/gi, '');

const InsertMedicalRecord = () => {
    const { recordTypes, loadingRecordTypes, errorRecordTypes } = useRecordTypes();
    const [visible, setVisible] = useState(false);
    const formik = useFormik({
        initialValues: {
            recordType: '',
            recordData: ''
        },
        onSubmit: (values) => console.log(values),
        validationSchema: Yup.object({
            recordType: Yup.string().required('Required').matches(/\d+$/, "Register new category"),
            recordData: Yup.string().required('Required')
                .test('min-length-no-html', 'Minimum 3 characters', (value) => {
                    const strippedText = stripHtmlTags(value);
                    return strippedText.length >= 3;
                })
        })
    });
    const formikCategory = useFormik({
        initialValues: {
            category: ''
        },
        onSubmit: (values) => console.log(values),
        validationSchema: Yup.object({
            category: Yup.string().required('Required')
        })
    });

    useEffect(() => {
        if (formik.values.recordType === 'Other') setVisible(true)
    }, [formik.values.recordType])

    if (errorRecordTypes) {
        return <div>Data Unavailable</div>
    };

    console.log(formik.values);

    return (
        <Card title="Add Health Data" className="flex justify-content-center align-items-center card-min-height">
            <form className="flex flex-column gap-4" onSubmit={formik.handleSubmit}>
                <FloatLabel>
                    <Dropdown
                        loading={loadingRecordTypes}
                        inputId="record-type"
                        options={!loadingRecordTypes ? [...recordTypes, {"recordTypeId": 'Other', "recordName": 'Other'}] : formik.initialValues.recordType }
                        optionValue="recordTypeId"
                        optionLabel="recordName"
                        className="w-full"
                        {...formik.getFieldProps("recordType")}
                    />
                    <label htmlFor="record-type">Health Data Category</label>
                    {formik.touched.recordType && formik.errors.recordType &&<div className="text-red-500 text-xs">{formik.errors.recordType}</div>}
                </FloatLabel>
                <div>
                    <Editor
                        textareaName="record-data"
                        apiKey={TINYMCE_API_KEY}
                        onEditorChange={(newValue, _editor) => {
                            formik.setFieldTouched("recordData", true);
                            formik.setFieldValue("recordData", newValue);
                        }}
                        onBlur={() => formik.setFieldTouched("recordData", true)}
                        initialValue={formik.initialValues.recordData}
                        init={{
                        height: 500,
                        menubar: false,
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                            'bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                        }}
                    />
                    {formik.touched.recordData && formik.errors.recordData && <div className="text-red-500 text-xs">{formik.errors.recordData}</div>}
                </div>
                <Button type="submit" label="Confirm" disabled={!formik.isValid || loadingRecordTypes} loading={loadingRecordTypes} />
            </form>
            <Dialog
                header="New Category"
                visible={visible}
                className="dialog-custom-header"
                style={{ width: '50vw' }}
                onHide={() => {if (!visible) return; setVisible(false);}}
            >
                <form className="flex flex-column pt-4 gap-4">
                    <FloatLabel>
                        <InputText
                            id="category"
                            className="w-full"
                            {...formikCategory.getFieldProps("category")}
                        />
                        <label htmlFor="category">Health Data Category</label>
                        {formikCategory.touched.category && formikCategory.errors.category && <div className="text-red-500 text-xs">{formikCategory.errors.category}</div>}
                    </FloatLabel>
                    <Button type="submit" label="Confirm" disabled={!formikCategory.isValid} />
                </form>
            </Dialog>

        </Card>
    );
};
export default InsertMedicalRecord;