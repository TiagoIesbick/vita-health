import { gql } from '@apollo/client';
import { medicalRecordsFragment, doctorDetailFragment, patientDetailFragment, userDetailFragment, recordTypeFragment, tokenFragment } from './fragments';


export const userQuery = gql`
    query User($id: ID!) {
        user(userId: $id) {
            ...UserDetail
            patient {
                ...PatientDetail
            }
            doctor {
                ...DoctorDetail
            }
        }
    }
    ${userDetailFragment}
    ${patientDetailFragment}
    ${doctorDetailFragment}
`;


export const recordTypesQuery = gql`
    query RecordTypes {
        recordTypes {
            ...RecordTypeDetail
        }
    }
    ${recordTypeFragment}
`;


export const medicalRecordsQuery = gql`
    query MedicalRecords ($limit: Int, $offset: Int) {
        medicalRecords (limit: $limit, offset: $offset) {
            items {
                ...MedicalRecordsDetail
            }
            totalCount
        }
    }
    ${medicalRecordsFragment}
`;


export const medicalRecordQuery = gql`
    query MedicalRecord ($recordId: ID!) {
        medicalRecord (recordId: $recordId) {
            ...MedicalRecordsDetail
        }
    }
    ${medicalRecordsFragment}
`;


export const activePatientTokensQuery = gql`
    query ActivePatientTokens {
        activePatientTokens {
            ...TokenDetail
        }
    }
    ${tokenFragment}
`;


export const activeDoctorTokensQuery = gql`
    query ActiveDoctorTokens {
        activeDoctorTokens {
            ...TokenDetail
        }
    }
    ${tokenFragment}
`;


export const inactiveTokensQuery = gql`
    query InactiveTokens ($limit: Int, $offset: Int) {
        inactiveTokens (limit: $limit, offset: $offset) {
            items {
                ...TokenDetail
            }
            totalCount
        }
    }
    ${tokenFragment}
`;


export const aiConversationQuery = gql`
    query AIConversation {
        aiConversation {
            role
            content
        }
    }
`;


export const messageSubscription = gql`
    subscription MessageSubscription {
        message {
            role
            content
        }
    }
`;
