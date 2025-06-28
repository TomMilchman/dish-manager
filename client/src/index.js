import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "react-toastify";
import ModalContainer from "./components/Modal/ModalContainer";

const queryClient = new QueryClient({
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ModalContainer />
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);
