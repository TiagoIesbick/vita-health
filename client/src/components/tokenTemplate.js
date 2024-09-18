import ListItem from "../components/listItem";
import GridItem from "../components/gridItem";


const TokenTemplate = ({ user, token, layout, index, confirm }) => {
    if (!token) {
        return;
    };

    if (layout === 'list') return <ListItem user={user} token={token} index={index} confirm={confirm} key={token.tokenId} />;
    else if (layout === 'grid') return <GridItem user={user} token={token} confirm={confirm} key={token.tokenId} />;
};
export default TokenTemplate;