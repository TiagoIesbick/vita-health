import { ApolloClient, ApolloLink, concat, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { Kind, OperationTypeNode } from 'graphql';
import { createClient as  createWsClient } from 'graphql-ws';
import { getAccessToken, ACCESS_TOKEN_KEY, ACCESS_MEDICAL_TOKEN_KEY } from './auth';
import { cache } from './cache';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';


export const BASE_URL_SERVER = process.env.NODE_ENV === 'production'
    ? 'https://vita-health.fr.to'
    : 'http://localhost:8000';


const BASE_WS_SERVER = process.env.NODE_ENV === 'production'
    ? 'wss://vita-health.fr.to'
    : 'ws://localhost:8000';


const upploadLink = createUploadLink({ uri: BASE_URL_SERVER + '/graphql/' })


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


const httpLink = concat(authLink, upploadLink);


const wsLink = new GraphQLWsLink(createWsClient({
    url: BASE_WS_SERVER + '/graphql/'
}));


const isSubscription = (operation) => {
    const definition = getMainDefinition(operation.query);
    return definition.kind === Kind.OPERATION_DEFINITION
        && definition.operation === OperationTypeNode.SUBSCRIPTION;
};


export const apolloClient = new ApolloClient({
    link: split(isSubscription, wsLink, httpLink),
    cache: cache
});
