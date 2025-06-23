// @ts-check
/// <reference types="jest" />

const {
    login,
    register,
    refresh,
    forgotPassword,
    resetPassword,
    logout,
} = require("../../controllers/authController");
const authService = require("../../services/authService");
const { sendEmail } = require("../../services/emailService");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

jest.mock("../../models/User");
jest.mock("../../services/authService");
jest.mock("../../services/emailService", () => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("jsonwebtoken");
jest.mock("bcrypt");

describe("Auth Controller", () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                username: "testuser",
                email: "test@example.com",
                password: "password123",
                rememberMe: true,
            },
            cookies: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            clearCookie: jest.fn(),
        };
        jest.clearAllMocks();
    });

    // ------------------ LOGIN ------------------

    describe("login", () => {
        it("should return 401 if user not found", async () => {
            req.body = {
                usernameOrEmail: "test",
                password: "1234",
                rememberMe: false,
            };
            User.findOne = jest.fn().mockResolvedValue(null);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid login credentials.",
            });
        });

        it("should return 401 if password is incorrect", async () => {
            req.body = { usernameOrEmail: "test", password: "wrongpass" };
            User.findOne = jest.fn().mockResolvedValue({ password: "hashed" });
            bcrypt.compare = jest.fn().mockResolvedValue(false);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid login credentials.",
            });
        });

        it("should return access token and set refresh cookie if login is successful", async () => {
            req.body = {
                usernameOrEmail: "test",
                password: "rightpass",
                rememberMe: true,
            };
            const fakeUser = {
                username: "user123",
                password: "hashed",
            };
            User.findOne = jest.fn().mockResolvedValue(fakeUser);
            bcrypt.compare = jest.fn().mockResolvedValue(true);
            authService.generateJWTTokens = jest.fn().mockReturnValue({
                accessToken: "access123",
                refreshToken: "refresh123",
            });

            await login(req, res);

            expect(res.cookie).toHaveBeenCalledWith(
                "refreshToken",
                "refresh123",
                authService.getRefreshCookieOptions(true)
            );
            expect(res.json).toHaveBeenCalledWith({
                accessToken: "access123",
                username: "user123",
            });
        });

        it("should return 400 if something throws", async () => {
            req.body = {
                usernameOrEmail: "test",
                password: "test",
                rememberMe: true,
            };
            User.findOne = jest.fn().mockRejectedValue(new Error("DB error"));

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
        });
    });

    // ------------------ REGISTER -----------------

    describe("register", () => {
        it("should register a new user and return access token with refresh token cookie", async () => {
            User.findOne = jest.fn().mockResolvedValue(null);
            bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
            User.create = jest.fn().mockResolvedValue({
                _id: "userId",
                username: "testuser",
            });
            authService.generateJWTTokens = jest.fn().mockReturnValue({
                accessToken: "access123",
                refreshToken: "refresh123",
            });
            authService.getRefreshCookieOptions = jest.fn().mockReturnValue({
                httpOnly: true,
                secure: true,
                sameSite: "Strict",
                maxAge: 1000 * 60 * 60 * 24,
            });

            await register(req, res);

            expect(User.findOne).toHaveBeenCalledWith({
                $or: [{ username: "testuser" }, { email: "test@example.com" }],
            });
            expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
            expect(User.create).toHaveBeenCalledWith({
                username: "testuser",
                email: "test@example.com",
                password: "hashedPassword",
            });
            expect(authService.generateJWTTokens).toHaveBeenCalledWith(
                "userId",
                true
            );
            expect(res.cookie).toHaveBeenCalledWith(
                "refreshToken",
                "refresh123",
                expect.objectContaining({
                    httpOnly: true,
                    secure: true,
                    sameSite: "Strict",
                })
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                accessToken: "access123",
                username: "testuser",
            });
        });

        it("should return 409 if user already exists", async () => {
            User.findOne = jest.fn().mockResolvedValue({ _id: "existingUser" });

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                message: "Username or email already in use.",
            });
        });

        it("should return 500 on bcrypt error", async () => {
            User.findOne = jest.fn().mockResolvedValue(null);
            bcrypt.hash = jest
                .fn()
                .mockRejectedValue(new Error("bcrypt error"));

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Internal server error.",
            });
        });

        it("should return 500 on User.create error", async () => {
            User.findOne = jest.fn().mockResolvedValue(null);
            bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
            User.create = jest
                .fn()
                .mockRejectedValue(new Error("create error"));

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Internal server error.",
            });
        });
    });

    // ------------------ REFRESH ------------------

    describe("refresh", () => {
        it("should return 401 if no refresh token", () => {
            req.cookies = {};

            refresh(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "No refresh token",
            });
        });

        it("should return access token if refresh token is valid", () => {
            req.cookies.refreshToken = "validRefresh";
            jwt.verify = jest.fn().mockReturnValue({ userId: "user123" });
            jwt.sign = jest.fn().mockReturnValue("newAccess");

            refresh(req, res);

            expect(res.json).toHaveBeenCalledWith({ accessToken: "newAccess" });
        });

        it("should return 403 if refresh token is invalid", () => {
            req.cookies.refreshToken = "badToken";
            jwt.verify = jest.fn().mockImplementation(() => {
                throw new Error("Invalid");
            });

            refresh(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid refresh token",
            });
        });
    });

    // ------------------ FORGOT-PASSWORD -----------------
    describe("forgot password", () => {
        it("should respond with success message even if user not found", async () => {
            User.findOne = jest.fn().mockResolvedValue(null);
            await forgotPassword(req, res);

            expect(User.findOne).toHaveBeenCalledWith({
                email: "test@example.com",
            });
            expect(sendEmail).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "If user exists, email sent.",
            });
        });

        it("should generate token, save user, send email and respond", async () => {
            const userMock = {
                email: "test@example.com",
                save: jest.fn().mockResolvedValue(true),
            };

            User.findOne = jest.fn().mockResolvedValue(userMock);

            crypto.randomBytes = jest
                .fn()
                .mockReturnValue(Buffer.from("a".repeat(32)));
            crypto.createHash = jest.fn().mockReturnValue({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue("hashedtoken"),
            });

            await forgotPassword(req, res);

            expect(userMock.passwordResetToken).toBe("hashedtoken");
            expect(userMock.passwordResetExpires).toBeGreaterThan(Date.now());

            expect(userMock.save).toHaveBeenCalled();
            expect(sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: userMock.email,
                    subject: "Password Reset Request",
                    text: expect.any(String),
                })
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "If user exists, email sent.",
            });
        });

        it("should handle errors and respond with 500", async () => {
            User.findOne = jest.fn().mockRejectedValue(new Error("DB failure"));
            await forgotPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Internal server error.",
            });
        });
    });

    // ------------------ RESET-PASSWORD -----------------
    describe("reset password", () => {
        it("should respond 400 if no matching user found", async () => {
            User.findOne = jest.fn().mockResolvedValue(null);

            const originalCreateHash = crypto.createHash;
            crypto.createHash = jest.fn().mockReturnValue({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue("hashedtoken"),
            });

            await resetPassword(req, res);

            expect(User.findOne).toHaveBeenCalledWith({
                email: "test@example.com",
                passwordResetToken: "hashedtoken",
                passwordResetExpires: { $gt: expect.any(Number) },
            });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid or expired reset token.",
            });

            // Restore original createHash after test
            crypto.createHash = originalCreateHash;
        });

        it("should hash password, update user, send notification email, and respond 200", async () => {
            const req = {
                body: {
                    email: "test@example.com",
                    resetToken: "raw-reset-token",
                    password: "newStrongPass123",
                },
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            const mockUser = {
                email: "test@example.com",
                username: "testuser",
                passwordResetToken: "hashedtoken",
                passwordResetExpires: new Date(Date.now() + 10000),
                save: jest.fn().mockResolvedValue(true),
            };

            // Mock crypto hash
            const originalCreateHash = crypto.createHash;
            // @ts-ignore
            crypto.createHash = jest.fn(() => ({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue("hashedtoken"),
            }));

            // Mock bcrypt
            bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");

            // Mock User.findOne
            User.findOne = jest.fn().mockResolvedValue(mockUser);

            // Act
            // @ts-ignore
            await resetPassword(req, res);

            // Assert
            expect(crypto.createHash).toHaveBeenCalledWith("sha256");
            expect(bcrypt.hash).toHaveBeenCalledWith("newStrongPass123", 10);
            expect(mockUser.password).toBe("hashedPassword");
            expect(mockUser.passwordResetToken).toBeUndefined();
            expect(mockUser.passwordResetExpires).toBeUndefined();
            expect(mockUser.save).toHaveBeenCalled();

            expect(sendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: "test@example.com",
                    subject: "Password Has Been Reset",
                    text: expect.stringContaining("testuser"),
                })
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Password successfully reset.",
            });

            // Clean up
            crypto.createHash = originalCreateHash;
        });

        it("should handle errors and respond with 500", async () => {
            User.findOne = jest.fn().mockRejectedValue(new Error("DB failure"));
            await resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Internal server error.",
            });
        });
    });

    // ------------------ LOGOUT -----------------
    describe("logout", () => {
        it("should clear refreshToken cookie and respond with 200", () => {
            logout(req, res);

            expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Logged out successfully.",
            });
        });
    });
});
