import { useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Badge } from 'primereact/badge';


const ViewsButton = ({ token }) => {
    const op = useRef(null);

    const doctorName = (rowData) => {
        return rowData.doctor.user.firstName + ' ' + rowData.doctor.user.lastName;
    };

    return (
        <div className="card flex flex-column align-items-center gap-3">
            <Button
                rounded
                text
                onClick={(e) => op.current.toggle(e)}
            >
                <i className="pi pi-eye p-overlay-badge">
                    <Badge className="bg-primary-100" value={token.tokenAccess?.length || 0}></Badge>
                </i>
            </Button>
            <OverlayPanel ref={op} closeOnEscape className='max-w-full'>
                    <DataTable value={token.tokenAccess} paginator rows={5}>
                        <Column header="Name" body={doctorName} sortable />
                        <Column field="doctor.specialty" header="Specialty" />
                        <Column field="accessTime" header="Access Time" sortable />
                    </DataTable>
            </OverlayPanel>
        </div>
    );
};
export default ViewsButton;
