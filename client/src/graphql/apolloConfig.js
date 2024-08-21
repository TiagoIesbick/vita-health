import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, concat } from '@apollo/client';
import { getAccessToken, ACCESS_TOKEN_KEY } from './auth';

const BASE_URL_SERVER = process.env.NODE_ENV === 'production'
    ? 'http://server:8000'
    : 'http://localhost:8000';

const httpLink = createHttpLink({ uri: BASE_URL_SERVER + '/graphql/' })

const authLink = new ApolloLink((operation, forward) => {
    const accessToken = getAccessToken(ACCESS_TOKEN_KEY);
    if (accessToken) {
        operation.setContext({
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
    };
    return forward(operation);
});

export const apolloClient = new ApolloClient({
    link: concat(authLink, httpLink),
    cache: new InMemoryCache()
})
