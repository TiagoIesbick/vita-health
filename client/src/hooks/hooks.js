import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useApolloClient, useSubscription } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client";
import { activeDoctorTokensQuery, activePatientTokensQuery, aiConversationQuery, inactiveTokensQuery, medicalRecordQuery, medicalRecordsQuery, messageSubscription, recordTypesQuery, userQuery } from "../graphql/queries";
import { mutationCreateConversation, mutationCreateMedicalRecord, mutationCreatePatientOrDoctor, mutationCreateRecordType, mutationCreateUser, mutationDeactivateToken, mutationGenerateToken, mutationLogin, mutationMultipleUpload, mutationSaveTokenAccess, mutationUpdateDoctorUser, mutationUpdatePatientUser, mutationUpdateUser } from "../graphql/mutations";
import { limit, localDateTime } from "../utils/utils";
import { updateInactiveTokensCache } from "../graphql/cache";


export const useBackgroundImageResize = () => {
    const location = useLocation();

    useEffect(() => {
        const body = document.body;
        const backgroundImageResize = () => {
            const bodyHeight = body.scrollHeight;
            const windowHeight = window.innerHeight;
            if (bodyHeight > 2*windowHeight) {
                body.style.backgroundSize = 'auto';
            } else {
                body.style.backgroundSize = 'cover';
            };
        };
        backgroundImageResize();
        const resizeObserver = new ResizeObserver(() => backgroundImageResize());
        resizeObserver.observe(body);
        window.addEventListener('resize', backgroundImageResize);
        backgroundImageResize();
        return () => {
            resizeObserver.unobserve(body);
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


export const useMedicalRecords = (limit, offset) => {
    const { data, loading, error } = useQuery(medicalRecordsQuery, {
        variables: {limit, offset}
    });
    return {medicalRecords: data?.medicalRecords, loading, error: Boolean(error)};
};


export const useMedicalRecord = (recordId) => {
    const { data, loading, error } = useQuery(medicalRecordQuery, { variables: { recordId } });
    return {medicalRecord: data?.medicalRecord, loading, error: Boolean(error)};
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
                const newMedicalRecord = createMedicalRecord.medicalRecord;
                cache.writeQuery({
                    query: medicalRecordQuery,
                    variables: {recordId: newMedicalRecord.recordId},
                    data: { medicalRecord: newMedicalRecord }
                });
                const existingCacheData = cache.readQuery({
                    query: medicalRecordsQuery,
                    variables: { limit: 10, offset: 0}
                });
                if (!existingCacheData) return;
                const updatedMedicalRecords = {
                    ...existingCacheData.medicalRecords,
                    items: [newMedicalRecord, ...existingCacheData.medicalRecords.items || []],
                    totalCount: existingCacheData.medicalRecords.totalCount + 1,
                };
                cache.writeQuery({
                    query: medicalRecordsQuery,
                    variables: { limit: 10, offset: 0 },
                    data: { medicalRecords: updatedMedicalRecords}
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


export const useMultipleUpload = () => {
    const [mutate, { loading, error }] = useMutation(mutationMultipleUpload);

    const addFiles = async (recordId, files) => {
        const { data: { multipleUpload } } = await mutate({
            variables: { recordId, files },
            update: (cache, { data: { multipleUpload } }) => {
                if (multipleUpload.files.length > 0) {
                    cache.modify({
                        id: cache.identify({ __typename: "MedicalRecords", recordId }),
                        fields: {
                            files(existingFiles = []) {
                                return [...existingFiles, ...multipleUpload.files];
                            },
                        },
                    });
                };
            },
        });
        return multipleUpload;
    };
    return {
        addFiles,
        loadingFiles: loading,
        errorFiles: error
    };
};


export const useInfiniteMedicalRecords = () => {
    const [offset, setOffset] = useState(0);
    const { medicalRecords, loading, error } = useMedicalRecords(limit, offset);
    const [allRecords, setAllRecords] = useState(medicalRecords?.items || []);
    const loader = useRef(null);

    useEffect(() => {
        if (medicalRecords?.items) {
            setAllRecords((prevRecords) => {
                const newRecords = medicalRecords.items.filter(
                    (record) => !prevRecords.some((existing) => existing.recordId === record.recordId)
                );
                return [...prevRecords, ...newRecords];
            });
        }
    }, [medicalRecords]);

    const observerCallback = useCallback(
        (entries) => {
            const [entry] = entries;
            if (
                entry.isIntersecting &&
                !loading &&
                medicalRecords?.items?.length > 0 &&
                allRecords.length < medicalRecords?.totalCount
            ) setOffset((prevOffset) => prevOffset + limit);
        },
        [loading, medicalRecords, allRecords.length]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(observerCallback, { threshold: 1.0 });
        if (loader.current) observer.observe(loader.current);
        return () => observer.disconnect();
    }, [observerCallback]);

    return {
        allRecords,
        medicalRecords,
        loading,
        error,
        loader
    };
};


export const useAIConversation = () => {
    const { data, loading: queryLoading, error: queryError } = useQuery(aiConversationQuery);

    useSubscription(messageSubscription, {
        onData: ({ client: { cache }, data: { data: { message } } }) => {
            cache.updateQuery({ query: aiConversationQuery }, ({ aiConversation }) => {
                const lastMessage = aiConversation[aiConversation.length - 1];
                if (lastMessage?.role === 'assistant' && message.role === 'assistant') {
                    const updatedLastMessage = {
                        ...lastMessage,
                        content: lastMessage.content + message.content
                    };
                    return {
                        aiConversation: [
                            ...aiConversation.slice(0, -1),
                            updatedLastMessage
                        ]
                    };
                } else {
                    return { aiConversation: [...aiConversation, message] };
                };
            });
        },
        onError: (error) => {
            console.error('[Subscription Error]:', error);
        }
    });

    return {
        aiConversation: data?.aiConversation || [],
        loading: queryLoading,
        error: Boolean(queryError),
    };
};


export const useCreateConversation = () => {
    const [mutate, { loading, error }] = useMutation(mutationCreateConversation);

    const addConversation = async (values) => {
        const { data: { createConversation } } = await mutate({
            variables: values
        });
        return createConversation;
    };
    return {
        addConversation,
        loadingConversation: loading,
        errorConversation: error
    };
};
