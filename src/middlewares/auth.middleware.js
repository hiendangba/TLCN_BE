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

module.exports = authMiddleware;
