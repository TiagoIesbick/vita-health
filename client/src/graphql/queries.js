import { gql } from '@apollo/client';
import { medicalRecordsFragment, doctorDetailFragment, patientDetailFragment, userDetailFragment, recordTypeFragment } from './fragments';


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

export const activePatientTokensQuery = gql`
    query ActivePatientTokens {
        activePatientTokens {
            tokenId
            token
            expirationDate
            tokenAccess {
                tokenAccessId
                accessTime
                doctor {
                    ...DoctorDetail
                    user {
                        firstName
                        lastName
                    }
                }
            }
        }
    }
    ${doctorDetailFragment}
`;

export const activeDoctorTokensQuery = gql`
    query ActiveDoctorTokens {
        activeDoctorTokens {
            tokenId
            token
            expirationDate
            patient {
                ...PatientDetail
                user {
                    firstName
                    lastName
                }
            }
        }
    }
    ${patientDetailFragment}
`;
