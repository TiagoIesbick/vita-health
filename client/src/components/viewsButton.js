import { useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Badge } from 'primereact/badge';
import { localDateTime } from '../utils/utils';


const ViewsButton = ({ token }) => {
    const op = useRef(null);

    const tokenAccess = token.tokenAccess ? token.tokenAccess.slice(0) : [];

    const accessTime = (rowData) => {
        let date = localDateTime(rowData.accessTime, 'minus');
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString(undefined, {timeStyle:'short'})}`;
    };

    const mapTokenAccess = tokenAccess.map(tokenRef => ({
        doctorName: tokenRef.doctor.user.firstName + ' ' + tokenRef.doctor.user.lastName,
        specialty: tokenRef.doctor.specialty,
        accessTime: accessTime(tokenRef),
    }));

    return (
        <div className="card flex flex-column align-items-center gap-3">
            <Button
                rounded
                text
                onClick={(e) => op.current.toggle(e)}
            >
                <i className="pi pi-eye p-overlay-badge">
                    <Badge className="bg-primary-100" value={tokenAccess.length}></Badge>
                </i>
            </Button>
            <OverlayPanel ref={op} closeOnEscape className='max-w-full'>
                <DataTable value={mapTokenAccess} paginator rows={5} sortField="accessTime" sortOrder={-1}>
                    <Column header="Name" field="doctorName" sortable />
                    <Column header="Specialty" field="specialty" />
                    <Column header="Access Time" field="accessTime" sortable />
                </DataTable>
            </OverlayPanel>
        </div>
    );
};
export default ViewsButton;
