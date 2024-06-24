import { gql } from '@apollo/client';
import { userDetailFragment } from './mutations';

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

export const tokenIdQuery = gql`
    query TokenId($token: String!, $patientId: ID!, $expirationDate: String!) {
        token(token: $token, patientId: $patientId, expirationDate: $expirationDate) {
            tokenId
        }
    }
`;

export const userQuery = gql`
    query User($id: ID!) {
        user(userId: $id) {
            ...UserDetail
            patient {
                patientId
                gender
                dateOfBirth
            }
            doctor {
                doctorId
                specialty
                licenseNumber
            }
        }
    }
    ${userDetailFragment}
`;
