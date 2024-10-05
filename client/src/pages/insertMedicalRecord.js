import { Card } from "primereact/card";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown } from 'primereact/dropdown';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from 'primereact/button';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateMedicalRecord, useCreateRecordType, useMultipleUpload, useRecordTypes } from "../hooks/hooks";
import { useUserQuery } from '../hooks/hooks';
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Dialog } from 'primereact/dialog';
import { InputText } from "primereact/inputtext";
import { useUser } from "../providers/userContext";
import { useApolloClient } from "@apollo/client";
import { ACCESS_MEDICAL_TOKEN_KEY, deleteCookie } from "../graphql/auth";
import { delTokenFromActiveDoctorTokensCache } from "../graphql/cache";
import { TINYMCE_API_KEY, stripHtmlTags, supportedFileFormats } from "../utils/utils";
import CountDown from "../components/countdown";
import LoadingSkeleton from "../components/skeleton";
import MultipleUpload from "../components/multipleUpload";
import './insertMedicalRecord.css';


const InsertMedicalRecord = () => {
    const navigate = useNavigate();
    const client = useApolloClient();
    const { user, patient, setPatient, showMessage } = useUser();
    const { userDetail, loadingUser, errorUser } = useUserQuery(patient?.userId || 0);
    const { recordTypes, loadingRecordTypes, errorRecordTypes } = useRecordTypes();
    const { addRecordType, loadingRecordType, errorRecordType } = useCreateRecordType();
    const { addMedicalRecord, loadingMedicalRecord, errorMedicalRecord } = useCreateMedicalRecord();
    const { addFiles, loadingFiles, errorFiles } = useMultipleUpload();
    const clickableWarning = useRef(null);
    const [visible, setVisible] = useState(false);
    const formik = useFormik({
        initialValues: {
            recordTypeId: '',
            recordData: '',
            files: []
        },
        onSubmit: async (values, { resetForm, setStatus }) => {
            const { files: _, ...recordValues } = values;
            const resMedicalRecord = await addMedicalRecord(recordValues);
            if (resMedicalRecord.medicalRecordError) {
                showMessage('error', 'Error', resMedicalRecord.medicalRecordError);
                if (resMedicalRecord.medicalRecordError === 'Missing authorization') {
                    delTokenFromActiveDoctorTokensCache(client.cache, patient.tokenId);
                    setPatient(null);
                    deleteCookie(ACCESS_MEDICAL_TOKEN_KEY);
                    resetForm();
                    navigate('/');
                };
            } else if (values.files.length > 0) {
                const resAddFiles = await addFiles(resMedicalRecord.medicalRecord.recordId, values.files);
                if (resAddFiles.fileError) {
                    showMessage('warn', 'Warning', 'Health data was created, but some files had errors', true);
                    resAddFiles.fileError.forEach(error => showMessage('error', 'Error', error, true));
                    resetForm();
                } else {
                    setStatus({ success: resAddFiles.fileConfirmation});
                    showMessage('success', 'Success', resMedicalRecord.medicalRecordConfirmation);
                    showMessage('success', 'Success', resAddFiles.fileConfirmation);
                    if (user.userType === 'Doctor') navigate('/medical-records-access');
                };
            } else {
                resetForm();
                showMessage('success', 'Success', resMedicalRecord.medicalRecordConfirmation);
                if (user.userType === 'Doctor') navigate('/medical-records-access');
            };
        },
        validationSchema: Yup.object({
            recordTypeId: Yup.string().required('Required').matches(/\d+$/, "Register new category"),
            recordData: Yup.string().required('Required')
                .test('min-length-no-html', 'Minimum 3 characters', (value) => {
                    const strippedText = stripHtmlTags(value);
                    return strippedText.length >= 3;
                }),
            files: Yup.array().nullable().notRequired().of(
                Yup.mixed()
                    .test('FILE_FORMAT', "Uploaded file has unsupported format", (file) => {
                        return file ? supportedFileFormats.includes(file.type) : true;
                    })
                    .test('FILE_SIZE', "Uploaded file is too big (max 1000kb)", (file) => {
                        return file ? file.size <= 1000 * 1024 : true;
                    })
                )
                .test('MAX_FILES', 'You can only upload a maximum of 10 files', (files) => {
                    return files ? files.length <= 10 : true;
                })
                .test('TOTAL_SIZE', 'Total size of uploaded files must not exceed 10MB', (files) => {
                    if (!files) return true;
                    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
                    return totalSize <= 10 * 1024 * 1024;
                })
        })
    });
    const formikCategory = useFormik({
        initialValues: {
            category: ''
        },
        onSubmit: async (values) => {
            const resRecordType = await addRecordType(values);
            if (resRecordType.recordTypeError) {
                showMessage('error', 'Error', resRecordType.recordTypeError)
            } else {
                formik.setFieldValue("recordTypeId", resRecordType.recordTypeId);
                setVisible(false);
            };
        },
        validationSchema: Yup.object({
            category: Yup.string().required('Required').min(3, 'Minimum 3 characters')
        })
    });

    useEffect(() => {
        if (formik.values.recordTypeId === 'Other') setVisible(true);
    }, [formik.values.recordTypeId]);

    useEffect(() => {
        if (clickableWarning.current) {
            if (clickableWarning.current.textContent === 'Register new category') {
            clickableWarning.current.classList.add("register-category");
            } else { clickableWarning.current.classList.remove("register-category"); }
        };
    });

    const handleClick = (e) => {
        if (e.target.textContent === 'Register new category') setVisible(true);
    };

    if (user.userType === 'Doctor' && loadingUser) {
        return <LoadingSkeleton />;
    };

    if (errorRecordTypes || errorRecordType || errorMedicalRecord || errorFiles || (user.userType === 'Doctor' && errorUser)) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <Card title="Add Health Data" className="flex justify-content-center align-items-center card-min-height">
            {user.userType === 'Doctor' && <CountDown patient={patient} setPatient={setPatient} showMessage={showMessage} patientDetail={userDetail} />}
            <form className="flex flex-column gap-4" onSubmit={formik.handleSubmit}>
                <FloatLabel>
                    <Dropdown
                        loading={loadingRecordTypes}
                        inputId="record-type"
                        options={!loadingRecordTypes ? [...recordTypes, {"recordTypeId": 'Other', "recordName": 'Other...'}] : formik.initialValues.recordTypeId }
                        optionValue="recordTypeId"
                        optionLabel="recordName"
                        className="w-full"
                        {...formik.getFieldProps("recordTypeId")}
                    />
                    <label htmlFor="record-type">Health Data Category</label>
                    {formik.touched.recordTypeId && formik.errors.recordTypeId &&<div ref={clickableWarning} onClick={handleClick} className="text-red-500 text-xs">{formik.errors.recordTypeId}</div>}
                </FloatLabel>
                <div>
                    {/* <label style={{top: '-.3rem', fontSize: '12px', left: '0.75rem', position: 'relative'}} htmlFor="record-data">Health Data</label> */}
                    <Editor
                        textareaName="record-data"
                        apiKey={TINYMCE_API_KEY}
                        onEditorChange={(newValue, _editor) => {
                            if (newValue !== '') formik.setFieldTouched("recordData", true);
                            formik.setFieldValue("recordData", newValue);
                        }}
                        onBlur={() => formik.setFieldTouched("recordData", true)}
                        value={formik.values.recordData}
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
                <MultipleUpload formik={formik} />
                <Button type="submit" label="Confirm" disabled={!formik.isValid || loadingRecordTypes || loadingMedicalRecord || loadingFiles} loading={loadingRecordTypes || loadingMedicalRecord || loadingFiles} />
            </form>
            <Dialog
                header="New Category"
                visible={visible}
                className="dialog-custom-header"
                onHide={() => {if (!visible) return; setVisible(false);}}
            >
                <form className="flex flex-column pt-4 gap-4" onSubmit={formikCategory.handleSubmit}>
                    <FloatLabel>
                        <InputText
                            id="category"
                            className="w-full"
                            {...formikCategory.getFieldProps("category")}
                        />
                        <label htmlFor="category">Category</label>
                        {formikCategory.touched.category && formikCategory.errors.category && <div className="text-red-500 text-xs">{formikCategory.errors.category}</div>}
                    </FloatLabel>
                    <Button type="submit" label="Confirm" disabled={!formikCategory.isValid || loadingRecordType} loading={loadingRecordType} />
                </form>
            </Dialog>
        </Card>
    );
};
export default InsertMedicalRecord;