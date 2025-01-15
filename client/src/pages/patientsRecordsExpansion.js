import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Paginator } from 'primereact/paginator';
import { usePatientRecordsbyDoctor } from '../hooks/hooks';
import { useState } from 'react';
import { useLanguage } from "../providers/languageContext";
import { stripHtmlTags, dateTemplate, getRecordTypeTranslation } from '../utils/utils';


const PatientsRecordsExpansion = ({ data }) => {
    const { language, translations } = useLanguage();
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(5);
    const { patientRecordsbyDoctor, loading, error } = usePatientRecordsbyDoctor(rows, first, data.patientId);

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const notesFormat = (rowData) => {
        const strippedNotes = stripHtmlTags(rowData.recordData);
        const notes = strippedNotes.length > 27 ? `${strippedNotes.slice(0, 27)}...` : strippedNotes;
        return notes;
    };

    const filesLength = (rowData) => rowData.files.length;

    const mapItems = patientRecordsbyDoctor?.items?.map(record => {
        const translation = getRecordTypeTranslation(record.recordType, language);
        return {
            ...record,
            recordName: translation ? translation.translatedName : record.recordType.recordName
        };
    })

    return (
        <div className="p-3">
            <h5>{translations?.patients?.recordsFor} {data.patientFullName}</h5>
            <DataTable value={mapItems} loading={loading} dataKey="recordId" sortField="dateCreated" sortOrder={-1} selectionMode="single">
                <Column field="dateCreated" header={translations?.patients?.date} body={(rowData) => dateTemplate(rowData.dateCreated)}></Column>
                <Column field="recordName" header={translations?.insertMedicalRecord?.newCategoryLabel}></Column>
                <Column field="recordData" header={translations?.patients?.notes} body={notesFormat}></Column>
                <Column field="files" header={`N° ${translations?.search?.files}`} body={filesLength}></Column>
                {/* <Column field="status" header="Status" body={statusOrderBodyTemplate} sortable></Column>
                <Column headerStyle={{ width: '4rem' }} body={searchBodyTemplate}></Column> */}
            </DataTable>
            {!loading && <Paginator first={first} rows={rows} totalRecords={patientRecordsbyDoctor?.totalCount} onPageChange={onPageChange} template={{ layout: 'PrevPageLink CurrentPageReport NextPageLink' }} />}
        </div>
    );
};
export default PatientsRecordsExpansion;
