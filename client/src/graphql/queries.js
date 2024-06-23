import { gql } from '@apollo/client';

const medicalRecordsFragment = gql`
    fragment MedicalRecordsDetail on MedicalRecords {
        recordId
        recordData
        dateCreated
        recordType {
            recordTypeId
            recordName
        }
    }
`;

export const medicalRecordsQuery = gql`
    query medicalRecords {
        medicalRecords {
            ...MedicalRecordsDetail
        }
    }
    ${medicalRecordsFragment}
`;

export const medicalRecordsByPatientIdQuery = gql`
    query MedicalRecordsByPatientId ($patientId: ID!) {
        medicalRecordsByPatientId (patientId: $patientId) {
            ...MedicalRecordsDetail
        }
    }
    ${medicalRecordsFragment}
`;
