import { useQuery } from "@apollo/client";
import { medicalRecordsQuery } from "../graphql/queries";

export const useMedicalRecords = () => {
    const { data, loading, error } = useQuery(medicalRecordsQuery);
    return {medicalRecords: data?.medicalRecords, loading, error: Boolean(error)};
};
