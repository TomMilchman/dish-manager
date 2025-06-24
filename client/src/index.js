import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "react-toastify";

const queryClient = new QueryClient({
    defaultOptions: {
        mutations: {
            onError: (error) => {
                const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    "An error occurred";
                toast.error(message);
            },
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);
