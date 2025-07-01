import { QueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const queryClient = new QueryClient({
    defaultOptions: {
        mutations: {
            onError: (error) => {
                const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    "An error occurred";
                toast.error(message);
                console.error(message);
            },
        },
    },
});
