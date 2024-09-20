import ListItem from "../components/listItem";
import GridItem from "../components/gridItem";


const TokenTemplate = ({ user, token, layout, index, setVisible, setTokenId }) => {
    if (!token) {
        return;
    };

    if (layout === 'list') return <ListItem user={user} token={token} index={index} key={token.tokenId} setVisible={setVisible} setTokenId={setTokenId} />;
    else if (layout === 'grid') return <GridItem user={user} token={token} key={token.tokenId} setVisible={setVisible} setTokenId={setTokenId} />;
};
export default TokenTemplate;