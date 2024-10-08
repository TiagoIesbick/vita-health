import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApolloClient } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client";
import { activeDoctorTokensQuery, activePatientTokensQuery, inactiveTokensQuery, medicalRecordsQuery, recordTypesQuery, userQuery } from "../graphql/queries";
import { mutationCreateMedicalRecord, mutationCreatePatientOrDoctor, mutationCreateRecordType, mutationCreateUser, mutationDeactivateToken, mutationGenerateToken, mutationLogin, mutationSaveTokenAccess, mutationUpdateDoctorUser, mutationUpdatePatientUser, mutationUpdateUser } from "../graphql/mutations";
import { localDateTime } from "../utils/utils";
import { updateInactiveTokensCache } from "../graphql/cache";


export const useBackgroundImageResize = () => {
    const location = useLocation();

    useEffect(() => {
        const backgroundImageResize = () => {
            const body = document.body
            const bodyHeight = body.scrollHeight;
            const windowHeight = window.innerHeight;
            if (bodyHeight > 2*windowHeight) {
                body.style.backgroundSize = 'auto';
            } else {
                body.style.backgroundSize = 'cover';
            };
        };
        backgroundImageResize();
        window.addEventListener('resize', backgroundImageResize);
        backgroundImageResize();
        return () => {
            window.removeEventListener('resize', backgroundImageResize);
        };
    },[location])
};


export const useRealTimeCacheUpdate = (user) => {
    const client = useApolloClient();

    useEffect(() => {
        const expiredTokens = [];
        const updateCache = (query, field) => {
            const cachedData = client.readQuery({ query });
            if (cachedData && cachedData[field]) {
                const updatedTokens = cachedData[field].map((token) => {
                    const isExpired = localDateTime(token.expirationDate, 'minus') < new Date();
                    if (isExpired) {
                        if (user?.userType === 'Patient') expiredTokens.push(token);
                        return null;
                    } else {return token;};
                }).filter(Boolean);
                client.writeQuery({
                    query,
                    data: { [field]: updatedTokens },
                });
            };
        };
        const intervalId = setInterval(() => {
            if (user?.userType === 'Patient') {
                updateCache(activePatientTokensQuery, 'activePatientTokens');
                if (expiredTokens.length > 0) {
                    expiredTokens.forEach(token => {
                        updateInactiveTokensCache(client.cache, token);
                    });
                    expiredTokens.length = 0;
                };
            } else if (user?.userType === 'Doctor') {
                updateCache(activeDoctorTokensQuery, 'activeDoctorTokens');
            };
        }, 1000);
        return () => clearInterval(intervalId);
    }, [client, user?.userType]);
};


export const useMedicalRecords = () => {
    const { data, loading, error } = useQuery(medicalRecordsQuery);
    return {medicalRecords: data?.medicalRecords, loading, error: Boolean(error)};
};


export const useCreateUser = () => {
    const [mutate, { loading, error }] = useMutation(mutationCreateUser);

    const addUser = async (values) => {
        const { data: { createUser } } = await mutate({
            variables: { input: values }
        });
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
            variables: { expirationDate: tokenExpirationDateTime},
            update: (cache, { data: { generateToken }}) => {
                if (generateToken.tokenError) return;
                const existingCacheData = cache.readQuery({ query: activePatientTokensQuery });
                if (!existingCacheData) return;
                const newToken = generateToken.token;
                cache.writeQuery({
                    query: activePatientTokensQuery,
                    data: {
                        activePatientTokens: !existingCacheData.activePatientTokens
                        ? [newToken]
                        : [newToken, ...existingCacheData.activePatientTokens]
                    }
                });
            },
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

    const addTokenAccess = async (token) => {
        const { data: { saveTokenAccess } } = await mutate({
            variables: { token },
            update: (cache, { data: { saveTokenAccess }}) => {
                if (saveTokenAccess.accessError) return;
                const existingCacheData = cache.readQuery({ query: activeDoctorTokensQuery });
                if (!existingCacheData) return;
                const newToken = saveTokenAccess.tokenAccess.token;
                cache.writeQuery({
                    query: activeDoctorTokensQuery,
                    data: {
                        activeDoctorTokens: !existingCacheData.activeDoctorTokens
                        ? [newToken]
                        : !existingCacheData.activeDoctorTokens.some(obj => obj.tokenId === newToken.tokenId)
                        ? [newToken, ...existingCacheData.activeDoctorTokens].sort((a, b) => a.expirationDate.localeCompare(b.expirationDate))
                        : existingCacheData.activeDoctorTokens
                    }
                });
            },
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
    const { data, loading, error } = useQuery(userQuery, {
        variables: { id: userId }
    });
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
            variables: { input: values },
            update: (cache, { data: { updatePatientUser : { user }}}) => {
                if (user) {
                    cache.writeQuery({
                        query: userQuery,
                        variables: { id: user.userId },
                        data: { user }
                    });
                };
            },
        });
        return updatePatientUser;
    };
    return {
        editPatientUser,
        loadingUpdatePatientUser: loading,
        errorUpdatePatientUser: error
    };
};


export const useUpdateDoctorUser = () => {
    const [mutate, { loading, error }] = useMutation(mutationUpdateDoctorUser);

    const editDoctorUser = async (values) => {
        const { data: { updateDoctorUser } } = await mutate({
            variables: { input: values },
            update: (cache, { data: { updateDoctorUser : { user }}}) => {
                if (user) {
                    cache.writeQuery({
                        query: userQuery,
                        variables: { id: user.userId },
                        data: { user }
                    });
                };
            },
        });
        return updateDoctorUser;
    };
    return {
        editDoctorUser,
        loadingUpdateDoctorUser: loading,
        errorUpdateDoctorUser: error
    };
};


export const useActivePatientTokens = () => {
    const { data, loading, error } = useQuery(activePatientTokensQuery);
    return {activePatientTokens: data?.activePatientTokens, loadingActivePatientTokens: loading, errorActivePatientTokens: Boolean(error)};
};


export const useActiveDoctorTokens = () => {
    const { data, loading, error } = useQuery(activeDoctorTokensQuery);
    return {activeDoctorTokens: data?.activeDoctorTokens, loadingActiveDoctorTokens: loading, errorActiveDoctorTokens: Boolean(error)};
};


export const useInactiveTokens = (limit, offset) => {
    const { data, loading, error } = useQuery(inactiveTokensQuery, {
        variables: {limit, offset}
    });
    return {inactiveTokens: data?.inactiveTokens, loadingInactiveTokens: loading, errorInactiveTokens: Boolean(error)};
};


export const useRecordTypes = () => {
    const { data, loading, error } = useQuery(recordTypesQuery);
    return {recordTypes: data?.recordTypes, loadingRecordTypes: loading, errorRecordTypes: Boolean(error)};
};


export const useCreateRecordType = () => {
    const [mutate, { loading, error }] = useMutation(mutationCreateRecordType);

    const addRecordType = async ({ category }) => {
        const { data: { createRecordType } } = await mutate({
            variables: { recordName: category },
            update: (cache, { data: { createRecordType }}) => {
                if (createRecordType.recordTypeError) return;
                const existingCacheData = cache.readQuery({ query: recordTypesQuery });
                const newRecordType = {
                    __typename: 'RecordTypes',
                    recordTypeId: createRecordType.recordTypeId,
                    recordName: createRecordType.recordName,
                };
                const updatedRecordTypes = [
                    ...existingCacheData.recordTypes,
                    newRecordType,
                ];
                updatedRecordTypes.sort((a, b) => a.recordName.localeCompare(b.recordName));
                cache.writeQuery({
                    query: recordTypesQuery,
                    data: { recordTypes: updatedRecordTypes }
                });
            },
        });
        return createRecordType;
    };
    return {
        addRecordType,
        loadingRecordType: loading,
        errorRecordType: error
    };
};


export const useCreateMedicalRecord = () => {
    const [mutate, { loading, error }] = useMutation(mutationCreateMedicalRecord);

    const addMedicalRecord = async (values) => {
        const { data: { createMedicalRecord } } = await mutate({
            variables: values,
            update: (cache, { data: { createMedicalRecord }}) => {
                if (createMedicalRecord.medicalRecordError) return;
                const existingCacheData = cache.readQuery({ query: medicalRecordsQuery });
                if (!existingCacheData) return;
                const newMedicalRecord = createMedicalRecord.medicalRecord;
                cache.writeQuery({
                    query: medicalRecordsQuery,
                    data: {
                        medicalRecords: !existingCacheData.medicalRecords
                        ? [newMedicalRecord]
                        : [newMedicalRecord, ...existingCacheData.medicalRecords]
                    }
                });
            },
        });
        return createMedicalRecord;
    };
    return {
        addMedicalRecord,
        loadingMedicalRecord: loading,
        errorMedicalRecord: error
    };
};


export const useDeactivateToken = () => {
    const [mutate, { loading, error }] = useMutation(mutationDeactivateToken);

    const inactivateToken = async (tokenId) => {
        const { data: { deactivateToken } } = await mutate({
            variables: { tokenId },
            update: (cache, { data: { deactivateToken }}) => {
                if (deactivateToken.deactivateTokenError) return;
                let removedToken;
                cache.modify({
                    fields: {
                        activePatientTokens(existing = [], { readField }) {
                            removedToken = existing.find(
                                tokenRef => readField('tokenId', tokenRef) === deactivateToken.token.tokenId
                            );
                            return existing.filter(
                                tokenRef => readField('tokenId', tokenRef) !== deactivateToken.token.tokenId
                            );
                        }
                    }
                });
                if (removedToken) {
                    removedToken = {
                        ...removedToken,
                        expirationDate: deactivateToken.token.expirationDate
                    };
                    updateInactiveTokensCache(cache, removedToken);
                };
            },
        });
        return deactivateToken;
    };
    return {
        inactivateToken,
        loadingDeactivateToken: loading,
        errorDeactivateToken: error
    };
};