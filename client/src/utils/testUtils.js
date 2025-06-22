import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const renderWithProviders = (ui) => {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>{ui}</BrowserRouter>
        </QueryClientProvider>
    );
};

export default renderWithProviders;
