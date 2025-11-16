const jwt = require("jsonwebtoken");
const AuthError = require("../errors/AuthError");
const UserError = require("../errors/UserError")

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw AuthError.NO_TOKEN();
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.role = decoded.role;
        req.roleId = decoded.roleId;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            next(AuthError.TokenExpired());
        } else if (err.name === "JsonWebTokenError") {
            next(AuthError.InvalidToken());
        } else {
            next(err);
        }
    }
};

const isAdmin = (req, res, next) => {
    if (req.role !== "admin")
        throw AuthError.IsAdmin();
    next();
};

const resetPasswordMiddleware = (req, res, next) => {
    const resetToken = req.cookies.resetPassword_token;
    if (!resetToken) {
        throw UserError.NoHaveToken();
    }

    try {
        const payload = jwt.verify(resetToken, process.env.JWT_SECRET);
        req.resetPayload = payload;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw UserError.TokenExpired();
        }
        if (err.name === "JsonWebTokenError") {
            throw UserError.TokenInvalid();
        }
        throw err;
    }
}

module.exports = { authMiddleware, isAdmin, resetPasswordMiddleware };
