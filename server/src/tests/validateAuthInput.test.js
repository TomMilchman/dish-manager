// @ts-check
/// <reference types="jest" />

const testUtils = require("./testUtils");
const validateAuth = require("../middlewares/validateAuthInput");

describe("Registration input validation", () => {
    describe("Valid input", () => {
        it("should accept a valid registration", () => {
            const result = validateAuth.validateRegistration(
                testUtils.validUsername,
                testUtils.validEmail,
                testUtils.validPassword
            );
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });

    describe("Invalid inputs", () => {
        it("should reject a short password", () => {
            const result = validateAuth.validateRegistration(
                testUtils.validUsername,
                testUtils.validEmail,
                "abc"
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject an overly long password", () => {
            const result = validateAuth.validateRegistration(
                testUtils.validUsername,
                testUtils.validEmail,
                "a".repeat(100)
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject a username with invalid characters", () => {
            const result = validateAuth.validateRegistration(
                "user@123",
                testUtils.validEmail,
                testUtils.validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject a username that is too short", () => {
            const result = validateAuth.validateRegistration(
                "ab",
                testUtils.validEmail,
                testUtils.validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject a username that is too long", () => {
            const result = validateAuth.validateRegistration(
                "a".repeat(50),
                testUtils.validEmail,
                testUtils.validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject an invalid email format", () => {
            const result = validateAuth.validateRegistration(
                testUtils.validUsername,
                "not-an-email",
                testUtils.validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if any field is missing", () => {
            const result = validateAuth.validateRegistration(
                testUtils.validUsername,
                testUtils.validEmail,
                undefined
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
});

describe("Login input validation", () => {
    describe("Valid input", () => {
        it("should accept valid username and password", () => {
            const result = validateAuth.validateLogin(
                testUtils.validUsername,
                testUtils.validPassword
            );
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it("should accept valid email and password", () => {
            const result = validateAuth.validateLogin(
                testUtils.validEmail,
                testUtils.validPassword
            );
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });

    describe("Invalid inputs", () => {
        it("should reject if usernameOrEmail is empty", () => {
            const result = validateAuth.validateLogin(
                "",
                testUtils.validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if password is empty", () => {
            const result = validateAuth.validateLogin(
                testUtils.validUsername,
                ""
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if password is too short", () => {
            const result = validateAuth.validateLogin(
                testUtils.validUsername,
                "123"
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if password is too long", () => {
            const result = validateAuth.validateLogin(
                testUtils.validUsername,
                "a".repeat(100)
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if usernameOrEmail has special characters", () => {
            const result = validateAuth.validateLogin(
                "bad$user!",
                testUtils.validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if email format is invalid", () => {
            const result = validateAuth.validateLogin(
                "invalid-email",
                testUtils.validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
});
