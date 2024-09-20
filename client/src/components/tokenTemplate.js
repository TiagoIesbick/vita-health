import ListItem from "../components/listItem";
import GridItem from "../components/gridItem";


const TokenTemplate = ({ user, token, layout, index }) => {
    if (!token) {
        return;
    };

    if (layout === 'list') return <ListItem user={user} token={token} index={index} key={token.tokenId} />;
    else if (layout === 'grid') return <GridItem user={user} token={token} key={token.tokenId} />;
};
export default TokenTemplate;