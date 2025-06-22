import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "./RegisterPage";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "../api/axios";
import { toast } from "react-toastify";

jest.mock("react-toastify", () => ({
    toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("../api/axios");

const renderWithProviders = (ui) => {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>{ui}</BrowserRouter>
        </QueryClientProvider>
    );
};

describe("Register Page", () => {
    it("renders form inputs", () => {
        renderWithProviders(<Register />);
        expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Confirm Password")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /register/i })
        ).toBeInTheDocument();
    });

    it("shows error when passwords don't match", async () => {
        renderWithProviders(<Register />);

        fireEvent.change(screen.getByPlaceholderText("Username"), {
            target: { value: "testuser" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "123456" },
        });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
            target: { value: "654321" },
        });

        fireEvent.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Passwords don't match.");
        });
    });

    it("submits form when valid", async () => {
        axios.post.mockResolvedValueOnce({
            data: { accessToken: "test-token" },
        });

        renderWithProviders(<Register />);

        fireEvent.change(screen.getByPlaceholderText("Username"), {
            target: { value: "testuser" },
        });
        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "123456" },
        });
        fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
            target: { value: "123456" },
        });

        fireEvent.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/auth/register", {
                username: "testuser",
                email: "test@example.com",
                password: "123456",
                confirmPassword: "123456",
                rememberMe: false,
            });
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith(
                "Registration successful!"
            );
        });
    });
});
