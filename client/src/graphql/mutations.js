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

export const mutationCreateUser = gql`
    mutation CreateUser ($input: CreateUserInput!) {
        createUser(input: $input) {
            userConfirmation
            userError
            user {
                ...UserDetail
            }
        }
    }
    ${userDetailFragment}
`;

export const mutationCreatePatientOrDoctor = gql`
    mutation CreatePatientOrDoctorUser ($userId: ID!, $userType: String!) {
        createPatientOrDoctorUser(userId: $userId, userType: $userType) {
            userConfirmation
            userError
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
    ${userDetailFragment}
`;

export const mutationUpdateUser = gql`
    mutation UpdateUser ($input: UpdateUserInput!) {
        updateUser(input: $input) {
            userConfirmation
            userError
            user {
                ...UserDetail
            }
            token
        }
    }
    ${userDetailFragment}
`;

export const mutationUpdatePatientUser = gql`
    mutation UpdatePatientUser ($input: UpdatePatientInput!) {
        updatePatientUser(input: $input) {
            userConfirmation
            userError
            user {
                ...UserDetail
            }
        }
    }
    ${userDetailFragment}
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
