// @ts-check
/// <reference types="jest" />

const testUtils = require("../testUtils");
const {
    validateRegisterMiddleware,
    validateNoEmptyBodyParamsMiddleware,
} = require("../../middlewares/inputValidationMiddlewares");

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
