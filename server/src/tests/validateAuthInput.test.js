const { expect, test, it, describe } = require("@jest/globals");
const validateAuth = require("../middlewares/validateAuthInput");

const validUsername = "User123";
const validEmail = "test@gmail.com";
const validPassword = "Password123";

describe("Registration input validation", () => {
    describe("Valid input", () => {
        it("should accept a valid registration", () => {
            const result = validateAuth.validateRegistration(
                validUsername,
                validEmail,
                validPassword
            );
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });

    describe("Invalid inputs", () => {
        it("should reject a short password", () => {
            const result = validateAuth.validateRegistration(
                validUsername,
                validEmail,
                "abc"
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject an overly long password", () => {
            const result = validateAuth.validateRegistration(
                validUsername,
                validEmail,
                "a".repeat(100)
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject a username with invalid characters", () => {
            const result = validateAuth.validateRegistration(
                "user@123",
                validEmail,
                validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject a username that is too short", () => {
            const result = validateAuth.validateRegistration(
                "ab",
                validEmail,
                validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject a username that is too long", () => {
            const result = validateAuth.validateRegistration(
                "a".repeat(50),
                validEmail,
                validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject an invalid email format", () => {
            const result = validateAuth.validateRegistration(
                validUsername,
                "not-an-email",
                validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if any field is missing", () => {
            const result = validateAuth.validateRegistration(
                validUsername,
                validEmail,
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
                validUsername,
                validPassword
            );
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it("should accept valid email and password", () => {
            const result = validateAuth.validateLogin(
                validEmail,
                validPassword
            );
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });

    describe("Invalid inputs", () => {
        it("should reject if usernameOrEmail is empty", () => {
            const result = validateAuth.validateLogin("", validPassword);
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if password is empty", () => {
            const result = validateAuth.validateLogin(validUsername, "");
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if password is too short", () => {
            const result = validateAuth.validateLogin(validUsername, "123");
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if password is too long", () => {
            const result = validateAuth.validateLogin(
                validUsername,
                "a".repeat(100)
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if usernameOrEmail has special characters", () => {
            const result = validateAuth.validateLogin(
                "bad$user!",
                validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if email format is invalid", () => {
            const result = validateAuth.validateLogin(
                "invalid-email",
                validPassword
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
});
