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


export const medicalRecordsFragment = gql`
    fragment MedicalRecordsDetail on MedicalRecords {
        recordId
        recordData
        dateCreated
        recordType {
            ...RecordTypeDetail
        }
    }
    ${recordTypeFragment}
`;