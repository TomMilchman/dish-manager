// @ts-check
/// <reference types="jest" />

const { login, refresh } = require("../../controllers/authController");
const authService = require("../../services/authService");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

jest.mock("../../models/User");
jest.mock("../../services/authService");
jest.mock("jsonwebtoken");
jest.mock("bcrypt");

describe("Auth Controller", () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            cookies: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
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
            const fakeUser = { _id: "user123", password: "hashed" };
            User.findOne = jest.fn().mockResolvedValue(fakeUser);
            bcrypt.compare = jest.fn().mockResolvedValue(true);
            authService.generateTokens = jest.fn().mockReturnValue({
                accessToken: "access123",
                refreshToken: "refresh123",
            });

            await login(req, res);

            expect(res.cookie).toHaveBeenCalledWith(
                "refreshToken",
                "refresh123",
                expect.objectContaining({
                    httpOnly: true,
                    secure: true,
                    sameSite: "Strict",
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                })
            );
            expect(res.json).toHaveBeenCalledWith({ accessToken: "access123" });
        });

        it("should return 400 if something throws", async () => {
            req.body = {};
            User.findOne = jest.fn().mockRejectedValue(new Error("DB error"));

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
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
});
