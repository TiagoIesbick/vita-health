import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const BASE_URL_SERVER = 'http://127.0.0.1:8000';

const httpLink = createHttpLink({ uri: BASE_URL_SERVER })

export const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
})
