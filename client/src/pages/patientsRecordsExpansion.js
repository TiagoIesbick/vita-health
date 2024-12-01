import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Paginator } from 'primereact/paginator';
import { usePatientRecordsbyDoctor } from '../hooks/hooks';
import { useState } from 'react';


const PatientsRecordsExpansion = ({ data }) => {
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(5);
    const { patientRecordsbyDoctor, loading, error } = usePatientRecordsbyDoctor(rows, first, data.patientId);

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    const filesLength = (rowData) => rowData.files.length;

    console.log('[PatientsRecordsExpansion]:', patientRecordsbyDoctor);
    return (
        <div className="p-3">
            <h5>Redords for {data.patientFullName}</h5>
            <DataTable value={patientRecordsbyDoctor?.items} loading={loading} dataKey="recordId" sortField="dateCreated" sortOrder={-1}>
                <Column field="dateCreated" header="Date"></Column>
                <Column field="recordType.recordName" header="Record"></Column>
                <Column field="files" header="N° Files" body={filesLength}></Column>
                {/* <Column field="status" header="Status" body={statusOrderBodyTemplate} sortable></Column>
                <Column headerStyle={{ width: '4rem' }} body={searchBodyTemplate}></Column> */}
            </DataTable>
            <Paginator first={first} rows={rows} totalRecords={patientRecordsbyDoctor?.totalCount} onPageChange={onPageChange} template={{ layout: 'PrevPageLink CurrentPageReport NextPageLink' }} />
        </div>
    );
};
export default PatientsRecordsExpansion;
