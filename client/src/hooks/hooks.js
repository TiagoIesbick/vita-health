import { useQuery, useMutation } from "@apollo/client";
import { medicalRecordsByPatientIdQuery, medicalRecordsQuery, userQuery } from "../graphql/queries";
import { mutationCreatePatientOrDoctor, mutationCreateUser, mutationGenerateToken, mutationLogin, mutationSaveTokenAccess, mutationUpdatePatientUser, mutationUpdateUser } from "../graphql/mutations";

export const useMedicalRecords = () => {
    const { data, loading, error } = useQuery(medicalRecordsQuery);
    return {medicalRecords: data?.medicalRecords, loading, error: Boolean(error)};
};

export const useMedicalRecordsByPatientId = (patientId) => {
    const { data, loading, error } = useQuery(medicalRecordsByPatientIdQuery, { variables: { patientId } });
    return {medicalRecords: data?.medicalRecordsByPatientId, loading, error: Boolean(error)};
};

export const useCreateUser = () => {
    const [mutate, { loading, error }] = useMutation(mutationCreateUser);

    const addUser = async (values) => {
        const { data: { createUser } } = await mutate({
            variables: { input: values }
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

export const useGenerateToken = () => {
    const [mutate, { loading, error }] = useMutation(mutationGenerateToken);

    const addToken = async (tokenExpirationDateTime) => {
        const { data: { generateToken } } = await mutate({
            variables: { expirationDate: tokenExpirationDateTime}
        });
        return generateToken;
    };
    return {
        addToken,
        loading,
        error
    };
};

export const useSaveTokenAccess = () => {
    const [mutate, { loading, error }] = useMutation(mutationSaveTokenAccess);

    const addTokenAccess = async (tokenId, doctorId) => {
        const { data: { saveTokenAccess } } = await mutate({
            variables: { tokenId: tokenId, doctorId}
        });
        return saveTokenAccess;
    };
    return {
        addTokenAccess,
        loadingTokenAccess: loading,
        errorTokenAccess: error
    };
};

export const useUserQuery = (userId) => {
    const { data, loading, error } = useQuery(userQuery, { variables: { id: userId } });
    return {userDetail: data?.user, loadingUser: loading, errorUser: Boolean(error)};
};

export const useUpdateUser = () => {
    const [mutate, { loading, error }] = useMutation(mutationUpdateUser);

    const editUser = async (values) => {
        const { data: { updateUser } } = await mutate({
            variables: { input: values }
        });
        return updateUser;
    };
    return {
        editUser,
        loadingUpdateUser: loading,
        errorUpdateUser: error
    };
};

export const useUpdatePatientUser = () => {
    const [mutate, { loading, error }] = useMutation(mutationUpdatePatientUser);

    const editPatientUser = async (values) => {
        const { data: { updatePatientUser } } = await mutate({
            variables: { input: values }
        });
        return updatePatientUser;
    };
    return {
        editPatientUser,
        loadingUpdatePatientUser: loading,
        errorUpdatePatientUser: error
    };
};
