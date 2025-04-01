import { useState } from "react";
import { AccountData } from "./type";

export function postSubmission(cb: Function) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const fn = async (args: any) => {
        setLoading(true);
        setError("")
        try {
            const response = await cb(args);
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
        fn,
    }
}