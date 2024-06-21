import { gql } from '@apollo/client';

export const medicalRecordsQuery = gql`
    query medicalRecords {
        medicalRecords {
            recordId
            recordData
            dateCreated
        }
    }
`;
