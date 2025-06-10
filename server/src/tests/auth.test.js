import { expect, jest, test, it, describe } from "@jest/globals";
const validateAuth = require("../middlewares/validateAuth");

const validUsername = "User123";
const validEmail = "test@gmail.com";
const validPassword = "Password123";

// TODO: make proper API calls for testing

describe("registration input validation", () => {
    it("is a valid registration", () => {
        let message = validateAuth.validateRegistration(
            validUsername,
            validEmail,
            validPassword
        ).message;
        expect(message).toBe(undefined);
    });

    it("is a short password", () => {
        let message = validateAuth.validateRegistration(
            validUsername,
            validEmail,
            "abc"
        ).message;
        expect(message).toBeDefined();
    });

    it("is a long password", () => {
        let message = validateAuth.validateRegistration(
            validUsername,
            validEmail,
            "abccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
        ).message;
        expect(message).toBeDefined();
    });

    it("has an invalid character in password", () => {
        let message = validateAuth.validateRegistration(
            validUsername,
            validEmail,
            "a@bc123"
        ).message;
        expect(message).toBeDefined();
    });
});
