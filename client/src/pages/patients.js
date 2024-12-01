import { Button } from 'primereact/button';
import { Card } from "primereact/card";
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useDoctorPatients } from "../hooks/hooks";
import { useUser } from "../providers/userContext";
import { useNavigate } from 'react-router';
import { useState } from "react";
import LoadingSkeleton from "../components/skeleton";
import PatientsRecordsExpansion from './patientsRecordsExpansion';


const Patients = () => {
    const navigate = useNavigate();
    const { showMessage } = useUser();
    const {doctorPatients, loadingDoctorPatients, errorDoctorPatients} = useDoctorPatients();
    const [expandedRows, setExpandedRows] = useState(null);

    const onRowExpand = (event) => {
        console.log('[onRowExpand]:', event);
    };

    const onRowCollapse = (event) => {
        console.log('[onRowCollapse]:', event);;
    };

    const expandAll = () => {
        let _expandedRows = {};

        //products.forEach((p) => (_expandedRows[`${p.id}`] = true));

        setExpandedRows(_expandedRows);
    };

    const collapseAll = () => {
        setExpandedRows(null);
    };

    const formatCurrency = (value) => {
        return value//.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const amountBodyTemplate = (rowData) => {
        return //formatCurrency(rowData.amount);
    };

    const statusOrderBodyTemplate = (rowData) => {
        return //<Tag value={rowData.status.toLowerCase()} severity={getOrderSeverity(rowData)}></Tag>;
    };

    const searchBodyTemplate = () => {
        return <Button icon="pi pi-search" />;
    };

    const imageBodyTemplate = (rowData) => {
        return //<img src={`https://primefaces.org/cdn/primereact/images/product/${rowData.image}`} alt={rowData.image} width="64px" className="shadow-4" />;
    };

    const priceBodyTemplate = (rowData) => {
        return formatCurrency(rowData.price);
    };

    const ratingBodyTemplate = (rowData) => {
        return //<Rating value={rowData.rating} readOnly cancel={false} />;
    };

    const statusBodyTemplate = (rowData) => {
        return //<Tag value={rowData.inventoryStatus} severity={getProductSeverity(rowData)}></Tag>;
    };



    const allowExpansion = (rowData) => {
        return true //rowData.orders.length > 0;
    };

    const header = (
        <div className="flex flex-wrap justify-content-end gap-2">
            <Button icon="pi pi-plus" label="Expand All" onClick={expandAll} text />
            <Button icon="pi pi-minus" label="Collapse All" onClick={collapseAll} text />
        </div>
    );

    if (loadingDoctorPatients) return <LoadingSkeleton />;

    if (errorDoctorPatients) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };
    console.log(doctorPatients);

    return (
        <Card className="card-min-height" title="Patients">
            <DataTable value={doctorPatients} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
                    onRowExpand={onRowExpand} onRowCollapse={onRowCollapse} rowExpansionTemplate={(data) => <PatientsRecordsExpansion data={data} />}
                    dataKey="patientId" header={header} tableStyle={{ minWidth: '60rem' }}>
                <Column expander={allowExpansion} style={{ width: '5rem' }} />
                <Column field="patientFullName" header="Name" sortable />
                <Column field="lastRecordCreated" header="Last Record" sortable />
            </DataTable>
        </Card>
    );
};
export default Patients;
