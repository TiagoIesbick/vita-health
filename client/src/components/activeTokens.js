import { useActiveTokens } from "../hooks/hooks";
import { Card } from "primereact/card";
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { useState } from "react";
import CopyButton from "./copyButton";


const ActiveTokens = () => {
    const { activeTokens, loading, error } = useActiveTokens();
    const [layout, setLayout] = useState('grid');

    const listItem = (token, index) => {
        return (
            <div className="col-12" key={token.tokenId}>
                <div className={classNames('flex flex-column gap-3', { 'border-top-1 surface-border': index !== 0 })}>
                    <div className="flex font-semibold mt-3 justify-content-center gap-1" >
                        <i className="pi pi-hourglass"></i>
                        <span>{token.expirationDate.slice(0, -3)}</span>
                    </div>
                    <div className="flex align-items-center gap-3 mb-3 justify-content-around">
                        <span className="flex align-items-center gap-2">
                            <span className="xs:w-full"><CopyButton txt={token.token}/></span>
                            <span className="text-xs xs:text-center" style={{wordBreak:'break-word'}}>{token.token}</span>
                        </span>
                        <span className="xs:w-full">
                            <Button text severity={'secondary'} className="gap-1 text-sm p-0">
                                <i className="pi pi-eye"></i>
                                {token.tokenAccess?.length || 0}
                            </Button>
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const gridItem = (token) => {
        return (
            <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" key={token.tokenId}>
                <div className="p-4 border-1 surface-border surface-card border-round">
                    <div className="flex flex-wrap align-items-center justify-content-end">
                        <CopyButton txt={token.token} />
                    </div>
                    <div className="flex flex-column align-items-center py-2">
                        <p className="font-semibold text-xs text-center" style={{wordBreak: 'break-all'}}>{token.token}</p>
                    </div>
                    <div className="flex align-items-center justify-content-between">
                        <div className='flex gap-1 text-sm'>
                            <i className="pi pi-hourglass"></i>
                            <span>{token.expirationDate.slice(0, -3)}</span>
                        </div>
                        <Button text severity={'secondary'} className="gap-1 text-sm p-0">
                            <i className="pi pi-eye"></i>
                            {token.tokenAccess?.length || 0}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const itemTemplate = (token, layout, index) => {
        if (!token) {
            return;
        };

        if (layout === 'list') return listItem(token, index);
        else if (layout === 'grid') return gridItem(token);
    };

    const listTemplate = (tokens, layout) => {
        if (!tokens) {
            return;
        };
        return <div className="grid grid-nogutter">{tokens.map((token, index) => itemTemplate(token, layout, index))}</div>;
    };

    const header = () => {
        return (
            <div className="flex justify-content-end">
                <DataViewLayoutOptions layout={layout} onChange={(e) => setLayout(e.value)} />
            </div>
        );
    };

    if (loading) {
        return <div>Loading...</div>
    };
    if (error) {
        return <div>Data Unavailable</div>
    };

    return (
        <Card style={{minHeight: 'calc(100vh - 128px)'}}>
            <DataView
                value={activeTokens}
                listTemplate={listTemplate}
                layout={layout}
                header={header()}
            />
        </Card>
    );
};
export default ActiveTokens;
