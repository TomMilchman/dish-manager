import { screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./LoginPage";
import axios from "../api/axios";
import { toast } from "react-toastify";
import renderWithProviders from "../utils/testUtils";

jest.mock("react-toastify", () => ({
    toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("../api/axios");

describe("Login Page", () => {
    it("renders form inputs", () => {
        renderWithProviders(<Login />);
        expect(
            screen.getByPlaceholderText("Username or email")
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /login/i })
        ).toBeInTheDocument();
    });

    it("submits form when valid (username login)", async () => {
        axios.post.mockResolvedValueOnce({
            data: { accessToken: "test-token" },
        });

        renderWithProviders(<Login />);

        fireEvent.change(screen.getByPlaceholderText("Username or email"), {
            target: { value: "testuser" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "123456" },
        });

        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/auth/login", {
                usernameOrEmail: "testuser",
                rememberMe: false,
                password: "123456",
            });
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("Login successful!");
        });
    });

    it("submits form when valid (email login)", async () => {
        axios.post.mockResolvedValueOnce({
            data: { accessToken: "test-token" },
        });

        renderWithProviders(<Login />);

        fireEvent.change(screen.getByPlaceholderText("Username or email"), {
            target: { value: "example@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
            target: { value: "123456" },
        });

        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/auth/login", {
                usernameOrEmail: "example@example.com",
                rememberMe: false,
                password: "123456",
            });
        });

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("Login successful!");
        });
    });
});
