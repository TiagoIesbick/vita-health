import { ApolloClient, createHttpLink, ApolloLink, concat } from '@apollo/client';
import { getAccessToken, ACCESS_TOKEN_KEY, ACCESS_MEDICAL_TOKEN_KEY } from './auth';
import { cache } from './cache';


const BASE_URL_SERVER = process.env.NODE_ENV === 'production'
    ? 'https://vita-health.fr.to'
    : 'http://localhost:8000';


const httpLink = createHttpLink({ uri: BASE_URL_SERVER + '/graphql/' })


const authLink = new ApolloLink((operation, forward) => {
    const accessToken = getAccessToken(ACCESS_TOKEN_KEY);
    const accessMedicalToken = getAccessToken(ACCESS_MEDICAL_TOKEN_KEY);
    operation.setContext({
        headers: {
            ...(accessToken && {'Authorization': `Bearer ${accessToken}`}),
            ...(accessMedicalToken && {'Medical-Authorization': `Bearer ${accessMedicalToken}`})
        }
    });
    return forward(operation);
});


export const apolloClient = new ApolloClient({
    link: concat(authLink, httpLink),
    cache: cache
});
