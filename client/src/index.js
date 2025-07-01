import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import ModalContainer from "./components/Modal/ModalContainer";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ModalContainer />
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);
