const { expect, test, it, describe } = require("@jest/globals");
const validateAuth = require("../middlewares/validateAuthInput");

const validUsername = "User123";
const validEmail = "test@gmail.com";
const validPassword = "Password123";

describe("Registration input validation", () => {
    describe("Valid input", () => {
        it("should accept a valid registration", () => {
            const { error } = validateAuth.validateRegistration(
                validUsername,
                validEmail,
                validPassword
            );
            expect(error).toBeUndefined();
        });
    });

    describe("Invalid inputs", () => {
        it("should reject a short password", () => {
            const { error } = validateAuth.validateRegistration(
                validUsername,
                validEmail,
                "abc"
            );
            expect(error).toBeDefined();
        });

        it("should reject an overly long password", () => {
            const { error } = validateAuth.validateRegistration(
                validUsername,
                validEmail,
                "a".repeat(100)
            );
            expect(error).toBeDefined();
        });

        it("should reject a username with invalid characters", () => {
            const { error } = validateAuth.validateRegistration(
                "user@123",
                validEmail,
                validPassword
            );
            expect(error).toBeDefined();
        });

        it("should reject a username that is too short", () => {
            const { error } = validateAuth.validateRegistration(
                "ab",
                validEmail,
                validPassword
            );
            expect(error).toBeDefined();
        });

        it("should reject a username that is too long", () => {
            const { error } = validateAuth.validateRegistration(
                "a".repeat(50),
                validEmail,
                validPassword
            );
            expect(error).toBeDefined();
        });

        it("should reject an invalid email format", () => {
            const { error } = validateAuth.validateRegistration(
                validUsername,
                "not-an-email",
                validPassword
            );
            expect(error).toBeDefined();
        });

        it("should reject if any field is missing", () => {
            const { error } = validateAuth.validateRegistration(
                validUsername,
                validEmail,
                undefined
            );
            expect(error).toBeDefined();
        });
    });
});

describe("Login input validation", () => {
    describe("Valid input", () => {
        it("should accept valid username and password", () => {
            const { error } = validateAuth.validateLogin(
                validUsername,
                validPassword
            );
            expect(error).toBeUndefined();
        });

        it("should accept valid email and password", () => {
            const { error } = validateAuth.validateLogin(
                validEmail,
                validPassword
            );
            expect(error).toBeUndefined();
        });
    });

    describe("Invalid inputs", () => {
        it("should reject if usernameOrEmail is empty", () => {
            const { error } = validateAuth.validateLogin("", validPassword);
            expect(error).toBeDefined();
        });

        it("should reject if password is empty", () => {
            const { error } = validateAuth.validateLogin(validUsername, "");
            expect(error).toBeDefined();
        });

        it("should reject if password is too short", () => {
            const { error } = validateAuth.validateLogin(validUsername, "123");
            expect(error).toBeDefined();
        });

        it("should reject if password is too long", () => {
            const { error } = validateAuth.validateLogin(
                validUsername,
                "a".repeat(100)
            );
            expect(error).toBeDefined();
        });

        it("should reject if usernameOrEmail has special characters", () => {
            const { error } = validateAuth.validateLogin(
                "bad$user!",
                validPassword
            );
            expect(error).toBeDefined();
        });

        it("should reject if email format is invalid", () => {
            const { error } = validateAuth.validateLogin(
                "invalid-email",
                validPassword
            );
            expect(error).toBeDefined();
        });
    });
});
