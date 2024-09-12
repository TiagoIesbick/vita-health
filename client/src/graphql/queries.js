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
    query medicalRecords {
        medicalRecords {
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
