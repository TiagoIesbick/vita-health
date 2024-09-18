import { DataViewLayoutOptions } from 'primereact/dataview';


const DataViewHeader = ({ layout, setLayout }) => {
    return (
        <div className="flex justify-content-end">
            <DataViewLayoutOptions layout={layout} onChange={(e) => setLayout(e.value)} />
        </div>
    );
};
export default DataViewHeader;