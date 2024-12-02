import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Paginator } from 'primereact/paginator';
import { usePatientRecordsbyDoctor } from '../hooks/hooks';
import { useState } from 'react';
import { stripHtmlTags } from '../utils/utils';


const PatientsRecordsExpansion = ({ data }) => {
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

    console.log('[PatientsRecordsExpansion]:', patientRecordsbyDoctor);
    return (
        <div className="p-3">
            <h5>Redords for {data.patientFullName}</h5>
            <DataTable value={patientRecordsbyDoctor?.items} loading={loading} dataKey="recordId" sortField="dateCreated" sortOrder={-1} selectionMode="single">
                <Column field="dateCreated" header="Date"></Column>
                <Column field="recordType.recordName" header="Record Type"></Column>
                <Column field="recordData" header="Notes" body={notesFormat}></Column>
                <Column field="files" header="N° Files" body={filesLength}></Column>
                {/* <Column field="status" header="Status" body={statusOrderBodyTemplate} sortable></Column>
                <Column headerStyle={{ width: '4rem' }} body={searchBodyTemplate}></Column> */}
            </DataTable>
            {!loading && <Paginator first={first} rows={rows} totalRecords={patientRecordsbyDoctor?.totalCount} onPageChange={onPageChange} template={{ layout: 'PrevPageLink CurrentPageReport NextPageLink' }} />}
        </div>
    );
};
export default PatientsRecordsExpansion;
