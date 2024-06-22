import { useQuery, useMutation } from "@apollo/client";
import { medicalRecordsQuery } from "../graphql/queries";
import { mutationCreatePatientOrDoctor, mutationCreateUser, mutationLogin } from "../graphql/mutations";

export const useMedicalRecords = () => {
    const { data, loading, error } = useQuery(medicalRecordsQuery);
    return {medicalRecords: data?.medicalRecords, loading, error: Boolean(error)};
};

export const useCreateUser = () => {
    const [mutate, { loading, error }] = useMutation(mutationCreateUser);

    const addUser = async (values) => {
        const { data: { createUser } } = await mutate({
            variables: { input: values}
        });
        console.log('[addUser]:', createUser);
        return createUser;
    };
    return {
        addUser,
        loadingUser: loading,
        errorUser: error
    };
};

export const useCreatePatientOrDoctor = () => {
    const [mutate, { loading, error }] = useMutation(mutationCreatePatientOrDoctor);

    const addPatientOrDoctor = async (userId, userType) => {
        const { data: { createPatientOrDoctorUser } } = await mutate({
            variables: { userId: userId, userType: userType }
        });
        return createPatientOrDoctorUser;
    };
    return {
        addPatientOrDoctor,
        loadingPatientOrDoctor: loading,
        errorPatientOrDoctor: error
    };
};

export const useLogin = () => {
    const [mutate, { loading, error }] = useMutation(mutationLogin);

    const doLogin = async (values) => {
        const { data: { login } } = await mutate({
            variables: values
        });
        return login;
    };
    return {
        doLogin,
        loading,
        error
    };
};
