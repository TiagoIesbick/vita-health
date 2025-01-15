import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from "primereact/card";
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useDoctorPatients } from "../hooks/hooks";
import { useUser } from "../providers/userContext";
import { useLanguage } from "../providers/languageContext";
import { useNavigate } from 'react-router';
import { useState } from "react";
import { FilterMatchMode, FilterOperator, FilterService } from 'primereact/api';
import LoadingSkeleton from "../components/skeleton";
import PatientsRecordsExpansion from './patientsRecordsExpansion';
import { dateTemplate } from '../utils/utils';


const Patients = () => {
    const navigate = useNavigate();
    const { showMessage } = useUser();
    const { translations } = useLanguage();
    const {doctorPatients, loadingDoctorPatients, errorDoctorPatients} = useDoctorPatients();
    const [expandedRows, setExpandedRows] = useState(null);

    const filters = {
        patientFullName: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        lastRecordCreated: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] }
    };

    const onRowExpand = (event) => {
        console.log('[onRowExpand]:', event);
    };

    const onRowCollapse = (event) => {
        console.log('[onRowCollapse]:', event);;
    };

    const expandAll = () => {
        let _expandedRows = {};
        const patients = doctorPatients || [];

        patients.forEach((p) => (_expandedRows[`${p.patientId}`] = true));

        setExpandedRows(_expandedRows);
    };

    const collapseAll = () => {
        setExpandedRows(null);
    };

    const dateFilterTemplate = (options) => {
        return <Calendar value={options.value} selectionMode="range" onChange={(e) => options.filterCallback(e.value, options.index)} />;
    };

    const header = (
        <div className="flex flex-wrap justify-content-end gap-2">
            <Button icon="pi pi-plus" label={translations?.patients?.expandAll} onClick={expandAll} text />
            <Button icon="pi pi-minus" label={translations?.patients?.collapseAll} onClick={collapseAll} text />
        </div>
    );

    if (loadingDoctorPatients) return <LoadingSkeleton />;

    if (errorDoctorPatients) {
        navigate('/');
        showMessage('error', translations?.error?.title, translations?.error?.message, true);
    };
    console.log(doctorPatients);

    return (
        <Card className="card-min-height" title={translations?.patients?.title}>
            <DataTable value={doctorPatients} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
                onRowExpand={onRowExpand} onRowCollapse={onRowCollapse} rowExpansionTemplate={(data) => <PatientsRecordsExpansion data={data} />}
                dataKey="patientId" header={header} tableStyle={{ minWidth: '100%' }} sortField="patientFullName" sortOrder={1}
                filterDisplay="row" emptyMessage={translations?.patients?.emptyMessage} filters={filters}
            >
                <Column expander style={{ width: '5rem' }} />
                <Column field="patientFullName" header={translations?.name} filter sortable />
                <Column field="lastRecordCreated" header={translations?.lastRecord} dataType="date" filter sortable body={(rowData) => dateTemplate(rowData.lastRecordCreated)} filterElement={dateFilterTemplate} />
            </DataTable>
        </Card>
    );
};
export default Patients;
