import { gql } from '@apollo/client';


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


export const userConfirmationFragment = gql`
    fragment UserConfirmationDetail on UserConfirmation {
        userConfirmation
        userError
    }
`;


export const recordTypeFragment = gql`
    fragment RecordTypeDetail on RecordTypes {
        recordTypeId
        recordName
    }
`;


export const fileFragment = gql`
    fragment FileDetail on Files {
        fileId
        fileName
        mimeType
        url
    }
`;


export const medicalRecordsFragment = gql`
    fragment MedicalRecordsDetail on MedicalRecords {
        recordId
        recordData
        dateCreated
        recordType {
            ...RecordTypeDetail
        }
        files {
            ...FileDetail
        }
    }
    ${recordTypeFragment}
    ${fileFragment}
`;


export const tokenFragment = gql`
    fragment TokenDetail on Tokens {
        tokenId
        token
        expirationDate
        patient {
            ...PatientDetail
            user {
                userId
                firstName
                lastName
            }
        }
        tokenAccess {
            tokenAccessId
            accessTime
            doctor {
                ...DoctorDetail
                user {
                    userId
                    firstName
                    lastName
                }
            }
        }
    }
    ${patientDetailFragment}
    ${doctorDetailFragment}
`;


export const tokenAccessFragment = gql`
    fragment TokenAccessDetail on TokenAccess {
        tokenAccessId
        accessTime
        token {
            ...TokenDetail
        }
        doctor {
            ...DoctorDetail
            user {
                userId
                firstName
                lastName
            }
        }
    }
    ${tokenFragment}
    ${doctorDetailFragment}
`;