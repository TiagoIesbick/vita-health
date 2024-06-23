import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, concat } from '@apollo/client';
import { getAccessToken } from './auth';

const BASE_URL_SERVER = 'http://127.0.0.1:8000';

const httpLink = createHttpLink({ uri: BASE_URL_SERVER + '/graphql/' })

const authLink = new ApolloLink((operation, forward) => {
    const accessToken = getAccessToken();
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
