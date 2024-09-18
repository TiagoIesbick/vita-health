import { InMemoryCache } from "@apollo/client";
import { localDateTime } from "../utils/utils";


export const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                activePatientTokens: {
                    keyArgs: false,
                    merge(existing = [], incoming, { readField }) {
                        return mergeTokens(existing, incoming, readField);
                    }
                },
                activeDoctorTokens: {
                    keyArgs: false,
                    merge(existing = [], incoming, { readField }) {
                        return mergeTokens(existing, incoming, readField);
                    }
                },
            }
        },
        Users: {
            keyFields: ['userId'],
        },
        Patients: {
            keyFields: ['patientId'],
        },
        Tokens: {
            keyFields: ['tokenId'],
        },
        TokenAccess: {
            keyFields: ['tokenAccessId']
        },
        Doctors: {
            keyFields: ['doctorId']
        },
        MedicalRecords: {
            keyFields: ['recordId']
        },
        RecordTypes: {
            keyFields: ['recordTypeId']
        }
    },
});


const mergeTokens = (existing = [], incoming, readField) => {
    const existingTokensMap = new Map(existing.map(token => [readField('tokenId', token), token]));
    if (!incoming) return;
    incoming.forEach(token => {
        existingTokensMap.set(readField('tokenId', token), token);
    });
    const now = new Date();
    const filteredTokens = Array.from(existingTokensMap.values())
        .filter(token => {
            const expirationDate = readField('expirationDate', token);
            if (!expirationDate) return false;
            return localDateTime(expirationDate, 'minus') > now;
        })
        .sort((a, b) => {
            const expirationDateA = new Date(readField('expirationDate', a));
            const expirationDateB = new Date(readField('expirationDate', b));
            return expirationDateA - expirationDateB;
        });
    return filteredTokens;
};
