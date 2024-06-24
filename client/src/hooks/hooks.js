import { useQuery, useMutation } from "@apollo/client";
import { medicalRecordsByPatientIdQuery, medicalRecordsQuery, tokenIdQuery, userQuery } from "../graphql/queries";
import { mutationCreatePatientOrDoctor, mutationCreateUser, mutationGenerateToken, mutationLogin, mutationSaveTokenAccess } from "../graphql/mutations";

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
            variables: { tokenId: tokenId.tokenId, doctorId}
        });
        return saveTokenAccess;
    };
    return {
        addTokenAccess,
        loadingTokenAccess: loading,
        errorTokenAccess: error
    };
};

export const useTokenId = (token, patientId, expirationDate) => {
    const { data, loading, error } = useQuery(tokenIdQuery, { variables: { token, patientId, expirationDate } });
    return {tokenId: data?.token, loadingToken: loading, errorToken: Boolean(error)};
};

export const useUserQuery = (userId) => {
    const { data, loading, error } = useQuery(userQuery, { variables: { id: userId } });
    return {userDetail: data?.user, loadingUser: loading, errorUser: Boolean(error)};
};
