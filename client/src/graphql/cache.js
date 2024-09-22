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
                inactiveTokens: {
                    keyArgs: ['limit', 'offset'],
                    merge(existing =  { items: [], totalCount: 0}, incoming, { args }) {
                        const mergedItems = existing.items ? existing.items.slice(0) : [];
                        const incomingItems = incoming.items ? incoming.items.slice(0) : [];
                        const offset = args?.offset ?? 0;
                        for (let i = 0; i < incomingItems.length; ++i) {
                            mergedItems[offset + i] = incomingItems[i];
                        }
                        return {
                            ...existing,
                            items: mergedItems,
                            totalCount: incoming.totalCount,
                            pagination: { offset: args.offset, limit: args.limit }
                        };
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
    const incomingData = incoming ? incoming.slice(0) : [];
    incomingData.forEach(token => {
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
