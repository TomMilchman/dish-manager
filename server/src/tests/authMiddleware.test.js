// @ts-check
/// <reference types="jest" />

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middlewares/authMiddleware");

jest.mock("jsonwebtoken");

describe("authenticateToken middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it("should return 401 if no token is provided", () => {
        req.headers.authorization = "";

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Access denied. No token provided.",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 if token is invalid", () => {
        req.headers.authorization = "Bearer invalidtoken";

        jwt.verify = jest.fn(() => {
            throw new Error("Invalid token");
        });

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid or expired token.",
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next and attach decoded user if token is valid", () => {
        const fakePayload = { userId: "abc123", role: "user" };
        req.headers.authorization = "Bearer validtoken";
        jwt.verify = jest.fn().mockReturnValue(fakePayload);

        authenticateToken(req, res, next);

        expect(req.user).toEqual(fakePayload);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});
