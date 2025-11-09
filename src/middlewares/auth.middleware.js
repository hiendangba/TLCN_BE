const jwt = require("jsonwebtoken");
const AuthError = require("../errors/AuthError");

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

module.exports = {authMiddleware, isAdmin};
