import { Card } from "primereact/card";
import { DataView } from 'primereact/dataview';
import { Paginator } from 'primereact/paginator';
import { useInactiveTokens } from "../hooks/hooks";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router';
import { useUser } from "../providers/userContext";
import LoadingSkeleton from "../components/skeleton";
import TokenTemplate from "../components/tokenTemplate";
import DataViewHeader from "../components/dataViewHeader";
import { TokenProvider } from "../providers/tokenContext";
import './inactiveTokens.css';


const InactiveTokens = () => {
    const navigate = useNavigate();
    const { user, showMessage } = useUser();
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(9);
    const { inactiveTokens, loadingInactiveTokens, errorInactiveTokens } = useInactiveTokens(rows, first);
    const [layout, setLayout] = useState('grid');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const listTemplate = (tokens, layout) => {
        if (!tokens) {
            return;
        };
        return (
            <div className="grid grid-nogutter">
                {tokens.map((token, index) => <TokenTemplate user={user} token={token} index={index} layout={layout} key={token.tokenId}/>)}
            </div>
        );
    };

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    if (loadingInactiveTokens) return <LoadingSkeleton />;

    if (errorInactiveTokens) {
        navigate('/');
        showMessage('error', 'Error', 'Data not available. Try again later.', true);
    };

    return (
        <TokenProvider>
            <Card className="card-min-height card-pb-0" title="Inative Tokens">
                <DataView
                    value={inactiveTokens.items}
                    listTemplate={listTemplate}
                    layout={layout}
                    header={<DataViewHeader layout={layout} setLayout={setLayout} />}
                />
                {isMobile
                    ? <Paginator first={first} rows={rows} totalRecords={inactiveTokens.totalCount} onPageChange={onPageChange} template={{ layout: 'PrevPageLink CurrentPageReport NextPageLink' }} />
                    : <Paginator first={first} rows={rows} totalRecords={inactiveTokens.totalCount} rowsPerPageOptions={[9, 18, 27]} onPageChange={onPageChange} />
                }
            </Card>
        </TokenProvider>
    );
};
export default InactiveTokens;