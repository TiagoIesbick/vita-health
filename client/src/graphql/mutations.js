import { gql } from "@apollo/client";
import { userConfirmationFragment, userDetailFragment, patientDetailFragment, doctorDetailFragment, medicalRecordsFragment, tokenFragment, tokenAccessFragment } from "./fragments";


export const mutationCreateUser = gql`
    mutation CreateUser ($input: CreateUserInput!) {
        createUser(input: $input) {
            ...UserConfirmationDetail
            user {
                ...UserDetail
            }
        }
    }
    ${userConfirmationFragment}
    ${userDetailFragment}
`;


export const mutationCreatePatientOrDoctor = gql`
    mutation CreatePatientOrDoctorUser ($userId: ID!, $userType: String!) {
        createPatientOrDoctorUser(userId: $userId, userType: $userType) {
            ...UserConfirmationDetail
            user {
                ...UserDetail
                patient {
                    patientId
                }
                doctor {
                    doctorId
                }
            }
        }
    }
    ${userConfirmationFragment}
    ${userDetailFragment}
`;


export const mutationUpdateUser = gql`
    mutation UpdateUser ($input: UpdateUserInput!) {
        updateUser(input: $input) {
            ...UserConfirmationDetail
            user {
                ...UserDetail
            }
            token
        }
    }
    ${userConfirmationFragment}
    ${userDetailFragment}
`;


export const mutationUpdatePatientUser = gql`
    mutation UpdatePatientUser ($input: UpdatePatientInput!) {
        updatePatientUser(input: $input) {
            ...UserConfirmationDetail
            user {
                ...UserDetail
                patient {
                    ...PatientDetail
                }
                doctor {
                    ...DoctorDetail
                }
            }
        }
    }
    ${userConfirmationFragment}
    ${userDetailFragment}
    ${patientDetailFragment}
    ${doctorDetailFragment}
`;


export const mutationUpdateDoctorUser = gql`
    mutation UpdateDoctorUser ($input: UpdateDoctorInput!) {
        updateDoctorUser(input: $input) {
            ...UserConfirmationDetail
            user {
                ...UserDetail
                patient {
                    ...PatientDetail
                }
                doctor {
                    ...DoctorDetail
                }
            }
        }
    }
    ${userConfirmationFragment}
    ${userDetailFragment}
    ${patientDetailFragment}
    ${doctorDetailFragment}
`;


export const mutationLogin = gql`
    mutation Login ($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            user {
                ...UserDetail
            }
            token
            error
        }
    }
    ${userDetailFragment}
`;


export const mutationGenerateToken = gql`
    mutation GenerateToken ($expirationDate: String!) {
        generateToken(expirationDate: $expirationDate) {
            tokenConfirmation
            tokenError
            token {
                ...TokenDetail
            }
        }
    }
    ${tokenFragment}
`;


export const mutationSaveTokenAccess = gql`
    mutation SaveTokenAccess ($token: String!) {
        saveTokenAccess(token: $token) {
            accessConfirmation
            accessError
            tokenAccess {
                ...TokenAccessDetail
            }
        }
    }
    ${tokenAccessFragment}
`;


export const mutationTokenId = gql`
    mutation TokenId($token: String!, $patientId: ID!, $expirationDate: String!) {
        token(token: $token, patientId: $patientId, expirationDate: $expirationDate) {
            tokenId
        }
    }
`;


export const mutationCreateRecordType = gql`
    mutation CreateRecordType ($recordName: String!) {
        createRecordType(recordName: $recordName) {
            recordTypeError
            recordTypeConfirmation
            recordTypeId
            recordName
        }
    }
`;


export const mutationCreateMedicalRecord = gql`
    mutation CreateMedicalRecord ($recordTypeId: ID!, $recordData: String!) {
        createMedicalRecord(recordTypeId: $recordTypeId, recordData: $recordData) {
            medicalRecordConfirmation
            medicalRecordError
            medicalRecord {
                ...MedicalRecordsDetail
            }
        }
    }
    ${medicalRecordsFragment}
`;