// @ts-check
/// <reference types="jest" />

const testUtils = require("../testUtils");
const {
    validateRegistration,
    validateRegisterMiddleware,
    validateNoEmptyBodyParamsMiddleware,
} = require("../../middlewares/inputValidationMiddlewares");

describe("_validateRegistration", () => {
    describe("Valid input", () => {
        it("should accept a valid registration", () => {
            const result = validateRegistration(
                testUtils.validUsername,
                testUtils.validEmail,
                testUtils.validPassword,
                true
            );
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });

    describe("Invalid inputs", () => {
        it("should reject a short password", () => {
            const result = validateRegistration(
                testUtils.validUsername,
                testUtils.validEmail,
                "abc",
                true
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject an overly long password", () => {
            const result = validateRegistration(
                testUtils.validUsername,
                testUtils.validEmail,
                "a".repeat(100),
                true
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject a username with invalid characters", () => {
            const result = validateRegistration(
                "user@123",
                testUtils.validEmail,
                testUtils.validPassword,
                true
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject a username that is too short", () => {
            const result = validateRegistration(
                "ab",
                testUtils.validEmail,
                testUtils.validPassword,
                true
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject a username that is too long", () => {
            const result = validateRegistration(
                "a".repeat(50),
                testUtils.validEmail,
                testUtils.validPassword,
                true
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject an invalid email format", () => {
            const result = validateRegistration(
                testUtils.validUsername,
                "not-an-email",
                testUtils.validPassword,
                true
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if any field is missing", () => {
            const result = validateRegistration(
                testUtils.validUsername,
                testUtils.validEmail,
                testUtils.validPassword,
                undefined
            );
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it("should reject if ", () => {
            const result = validateRegistration(
                testUtils.validUsername,
                testUtils.validEmail,
                undefined,
                true
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

        validateRegisterMiddleware(req, res, next);

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
            rememberMe: true,
        };

        validateRegisterMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});

describe("validateNoEmptyBodyParamsMiddleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it("should call next() if all body parameters are present", () => {
        req.body = {
            username: "user1",
            email: "user@example.com",
            password: "secret",
        };

        validateNoEmptyBodyParamsMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it("should return 400 if any body parameter is missing", () => {
        req.body = {
            username: "user1",
            email: "", // missing
            password: "secret",
        };

        validateNoEmptyBodyParamsMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Missing input: email",
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should detect first missing key only", () => {
        req.body = {
            username: "", // this is the first missing one
            email: "", // second
        };

        validateNoEmptyBodyParamsMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Missing input: username",
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should handle empty body gracefully", () => {
        req.body = {};

        validateNoEmptyBodyParamsMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});
