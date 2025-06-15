// @ts-check
/// <reference types="jest" />

const testUtils = require("./testUtils");
const validateAuth = require("../middlewares/validateAuthInputMiddleware");

describe("_validateRegistration", () => {
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

describe("validateRegisterMiddleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it("should return 400 if validation fails", () => {
        req.body = { username: "a", email: "invalid", password: "123" };

        validateAuth.validateRegisterMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.any(String) })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next() if validation passes", () => {
        req.body = {
            username: testUtils.validUsername,
            email: testUtils.validEmail,
            password: testUtils.validPassword,
        };

        validateAuth.validateRegisterMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});
