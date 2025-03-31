import { useState } from "react";
import { AccountData } from "./type";

export function newAccountSubmission(cb: Function) {
    const [data, setData] = useState<AccountData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const submitAccount = async (newData: AccountData) => {
        setLoading(true);
        setError("")
        try {
            const response = await cb(newData);
            setData(response);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    }

    return {
        data,
        loading,
        error,
        submitAccount,
    }
}