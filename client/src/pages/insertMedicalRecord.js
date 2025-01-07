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
import { useLanguage } from "../providers/languageContext";
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
    const { language, translations } = useLanguage();
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
                showMessage('error', translations?.error?.title, translations?.error?.[resMedicalRecord.medicalRecordError]);
                if (resMedicalRecord.medicalRecordError === "missAuthorization") {
                    delTokenFromActiveDoctorTokensCache(client.cache, patient.tokenId);
                    setPatient(null);
                    deleteCookie(ACCESS_MEDICAL_TOKEN_KEY);
                    resetForm();
                    navigate('/');
                };
            } else if (values.files.length > 0) {
                const resAddFiles = await addFiles(resMedicalRecord.medicalRecord.recordId, values.files);
                if (resAddFiles.fileError) {
                    showMessage('warn', translations?.warn?.title, translations?.warn?.message, true);
                    resAddFiles.fileError.forEach(error => {
                        let matchedErrorKey = translations?.error?.[error] ? error : null;
                        let filename = null;
                        if (!matchedErrorKey && error.includes(':')) {
                            const [file, key] = error.split(':').map(part => part.trim());
                            if (translations?.error?.[key]) {
                                matchedErrorKey = key;
                                filename = file;
                            }
                        }
                        const translatedMessage = matchedErrorKey
                            ? (filename
                                ? `${filename}: ${translations.error[matchedErrorKey]}`
                                : translations.error[matchedErrorKey])
                            : error;
                        showMessage('error', translations?.error?.title, translatedMessage, true)
                    });
                    resetForm();
                } else {
                    setStatus({ success: resAddFiles.fileConfirmation});
                    showMessage('success', translations?.success?.title, translations?.success?.[resMedicalRecord.medicalRecordConfirmation]);
                    showMessage('success', translations?.success?.title, translations?.success?.[resAddFiles.fileConfirmation]);
                    if (user.userType === 'Doctor') navigate('/medical-records-access');
                };
            } else {
                resetForm();
                showMessage('success', translations?.success?.title, translations?.success?.[resMedicalRecord.medicalRecordConfirmation]);
                if (user.userType === 'Doctor') navigate('/medical-records-access');
                // user.userType === 'Doctor' ? navigate('/medical-records-access') : navigate(`/medical-record/${resMedicalRecord.medicalRecord.recordId}`);
            };
        },
        validationSchema: Yup.object({
            recordTypeId: Yup.string().required(translations?.required).matches(/\d+$/, translations?.insertMedicalRecord?.registerNewCategory),
            recordData: Yup.string().required(translations?.required)
                .test('min-length-no-html', translations?.error?.minChars?.replace(/{(\w+)}/g, '3'), (value) => {
                    const strippedText = stripHtmlTags(value);
                    return strippedText.length >= 3;
                }),
            files: Yup.array().nullable().notRequired().of(
                Yup.mixed()
                    .test('FILE_FORMAT', translations?.error?.fileFormat, (file) => {
                        return file ? supportedFileFormats.includes(file.type) : true;
                    })
                    .test('FILE_SIZE', translations?.error?.fileSize, (file) => {
                        return file ? file.size <= 5 * 1024 * 1024 : true;
                    })
                )
                .test('MAX_FILES', translations?.error?.maxFiles, (files) => {
                    return files ? files.length <= 10 : true;
                })
                .test('TOTAL_SIZE', translations?.error?.totalSize, (files) => {
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
                showMessage('error', translations?.error?.title, translations?.error?.[resRecordType.recordTypeError])
            } else {
                formik.setFieldValue("recordTypeId", resRecordType.recordType.recordTypeId);
                setVisible(false);
            };
        },
        validationSchema: Yup.object({
            category: Yup.string().required(translations?.required).min(3, translations?.error?.minChars?.replace(/{(\w+)}/g, '3'))
        })
    });

    useEffect(() => {
        if (formik.values.recordTypeId === 'Other') setVisible(true);
    }, [formik.values.recordTypeId]);

    useEffect(() => {
        if (clickableWarning.current) {
            if (clickableWarning.current.textContent === translations?.insertMedicalRecord?.registerNewCategory) {
            clickableWarning.current.classList.add("register-category");
            } else { clickableWarning.current.classList.remove("register-category"); }
        };
    });

    const handleClick = (e) => {
        if (e.target.textContent === translations?.insertMedicalRecord?.registerNewCategory) setVisible(true);
    };

    if (user.userType === 'Doctor' && loadingUser) {
        return <LoadingSkeleton />;
    };

    if (errorRecordTypes || errorRecordType || errorMedicalRecord || errorFiles || (user.userType === 'Doctor' && errorUser)) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };

    const sortedRecordTypes = recordTypes?.map(record => {
        const translation = record.translation?.find(
            (t) => t.languageCode === language
        );
        return {
            ...record,
            recordName: translation ? translation.translatedName : record.recordName
        };
    }).sort((a, b) => a.recordName.localeCompare(b.recordName));

    return (
        <Card title={translations?.insertMedicalRecord?.title} className="flex justify-content-center align-items-center card-min-height">
            {user.userType === 'Doctor' && <CountDown patient={patient} setPatient={setPatient} showMessage={showMessage} patientDetail={userDetail} />}
            <form className="flex flex-column gap-4" onSubmit={formik.handleSubmit}>
                <FloatLabel>
                    <Dropdown
                        loading={loadingRecordTypes}
                        inputId="record-type"
                        options={!loadingRecordTypes ? [...sortedRecordTypes, {"recordTypeId": 'Other', "recordName": `${translations?.insertMedicalRecord?.other}...`}] : formik.initialValues.recordTypeId }
                        optionValue="recordTypeId"
                        optionLabel="recordName"
                        filter
                        className="w-full"
                        {...formik.getFieldProps("recordTypeId")}
                    />
                    <label htmlFor="record-type">{translations?.insertMedicalRecord?.category}</label>
                    {formik.touched.recordTypeId && formik.errors.recordTypeId &&<div ref={clickableWarning} onClick={handleClick} className="text-red-500 text-xs">{formik.errors.recordTypeId}</div>}
                </FloatLabel>
                <div>
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
                        placeholder: translations?.insertMedicalRecord?.notesPlaceholder,
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                            'bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:1rem }'
                        }}
                    />
                    {formik.touched.recordData && formik.errors.recordData && <div className="text-red-500 text-xs">{formik.errors.recordData}</div>}
                </div>
                <MultipleUpload formik={formik} translations={translations} />
                <Button type="submit" label={translations?.confirm} disabled={!formik.isValid || loadingRecordTypes || loadingMedicalRecord || loadingFiles} loading={loadingRecordTypes || loadingMedicalRecord || loadingFiles} />
            </form>
            <Dialog
                header={translations?.insertMedicalRecord?.newCategory}
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
                        <label htmlFor="category">{translations?.insertMedicalRecord?.newCategoryLabel}</label>
                        {formikCategory.touched.category && formikCategory.errors.category && <div className="text-red-500 text-xs">{formikCategory.errors.category}</div>}
                    </FloatLabel>
                    <Button type="submit" label={translations?.confirm} disabled={!formikCategory.isValid || loadingRecordType} loading={loadingRecordType} />
                </form>
            </Dialog>
        </Card>
    );
};
export default InsertMedicalRecord;