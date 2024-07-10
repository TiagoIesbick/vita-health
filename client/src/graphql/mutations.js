import { gql } from "@apollo/client";

export const userDetailFragment = gql`
    fragment UserDetail on Users {
        userId
        firstName
        lastName
        email
        password
        userType
        acceptTerms
    }
`;

export const patientDetailFragment = gql`
    fragment PatientDetail on Patients {
        patientId
        dateOfBirth
        gender
    }
`;

export const doctorDetailFragment = gql`
    fragment DoctorDetail on Doctors {
        doctorId
        specialty
        licenseNumber
    }
`;

const userConfirmationFragment = gql`
    fragment UserConfirmationDetail on UserConfirmation {
        userConfirmation
        userError
    }
`;

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
                tokenId
                token
                expirationDate
            }
        }
    }
`;

export const mutationSaveTokenAccess = gql`
    mutation SaveTokenAccess ($tokenId: ID!, $doctorId: ID!) {
        saveTokenAccess(tokenId: $tokenId, doctorId: $doctorId) {
            accessConfirmation
            accessError
        }
    }
`;

export const mutationTokenId = gql`
    mutation TokenId($token: String!, $patientId: ID!, $expirationDate: String!) {
        token(token: $token, patientId: $patientId, expirationDate: $expirationDate) {
            tokenId
        }
    }
`;
