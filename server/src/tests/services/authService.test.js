// @ts-check
/// <reference types="jest" />

const jwt = require("jsonwebtoken");

// Mock jwt.sign
jest.mock("jsonwebtoken");

const { generateTokens } = require("../../services/authService"); // adjust path

describe("generateTokens", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        // Reset environment variables
        process.env = { ...OLD_ENV };
        /** @type {jest.Mock} */
        (jwt.sign).mockClear();
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it("should generate access and refresh tokens with rememberMe = false", () => {
        process.env.JWT_SECRET = "jwtsecret";
        process.env.REFRESH_SECRET = "refreshsecret";

        /** @type {jest.Mock} */
        (jwt.sign)
            .mockReturnValueOnce("mockAccessToken")
            .mockReturnValueOnce("mockRefreshToken");

        const tokens = generateTokens("user123", false);

        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: "user123" },
            "jwtsecret",
            { expiresIn: "15m" }
        );

        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: "user123" },
            "refreshsecret",
            { expiresIn: "1d" }
        );

        expect(tokens).toEqual({
            accessToken: "mockAccessToken",
            refreshToken: "mockRefreshToken",
        });
    });

    it("should generate tokens with longer expiry if rememberMe = true", () => {
        process.env.JWT_SECRET = "jwtsecret";
        process.env.REFRESH_SECRET = "refreshsecret";

        /** @type {jest.Mock} */ (jwt.sign)
            .mockReturnValueOnce("mockAccessToken7d")
            .mockReturnValueOnce("mockRefreshToken30d");

        const tokens = generateTokens("user123", true);

        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: "user123" },
            "jwtsecret",
            { expiresIn: "7d" }
        );

        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: "user123" },
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

        expect(() => generateTokens("user123", false)).toThrow(
            "Missing JWT secret(s)."
        );
    });

    it("should throw error if userId is missing", () => {
        process.env.JWT_SECRET = "jwtsecret";
        process.env.REFRESH_SECRET = "refreshsecret";

        expect(() => generateTokens("", false)).toThrow("No user id provided.");
    });
});
