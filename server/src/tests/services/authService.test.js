// @ts-check
/// <reference types="jest" />

const jwt = require("jsonwebtoken");

// Mock jwt.sign
jest.mock("jsonwebtoken");

const { generateJWTTokens } = require("../../services/authService"); // adjust path

describe("generateJWTTokens", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        // Reset environment variables
        process.env = { ...OLD_ENV };
        jwt.sign = jest.fn().mockClear();
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it("should generate access and refresh tokens with rememberMe = false", () => {
        process.env.JWT_SECRET = "jwtsecret";
        process.env.REFRESH_SECRET = "refreshsecret";

        jwt.sign = jest
            .fn()
            .mockReturnValueOnce("mockAccessToken")
            .mockReturnValueOnce("mockRefreshToken");

        const tokens = generateJWTTokens("user123", false);

        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: "user123", role: "user" },
            "jwtsecret",
            { expiresIn: "15m" }
        );

        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: "user123", role: "user" },
            "refreshsecret",
            { expiresIn: "15m" }
        );

        expect(tokens).toEqual({
            accessToken: "mockAccessToken",
            refreshToken: "mockRefreshToken",
        });
    });

    it("should generate tokens with longer expiry if rememberMe = true", () => {
        process.env.JWT_SECRET = "jwtsecret";
        process.env.REFRESH_SECRET = "refreshsecret";

        jwt.sign = jest
            .fn()
            .mockReturnValueOnce("mockAccessToken7d")
            .mockReturnValueOnce("mockRefreshToken30d");

        const tokens = generateJWTTokens("user123", true);

        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: "user123", role: "user" },
            "jwtsecret",
            { expiresIn: "7d" }
        );

        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: "user123", role: "user" },
            "refreshsecret",
            { expiresIn: "30d" }
        );

        expect(tokens).toEqual({
            accessToken: "mockAccessToken7d",
            refreshToken: "mockRefreshToken30d",
        });
    });

    it("should throw error if JWT secrets are missing", () => {
        delete process.env.JWT_SECRET;
        delete process.env.REFRESH_SECRET;

        expect(() => generateJWTTokens("user123", false)).toThrow(
            "Missing JWT secret(s)."
        );
    });

    it("should throw error if userId is missing", () => {
        process.env.JWT_SECRET = "jwtsecret";
        process.env.REFRESH_SECRET = "refreshsecret";

        expect(() => generateJWTTokens("", false)).toThrow(
            "No user id provided."
        );
    });
});
