const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).send({ message: "No token provided." });
    }

    // Extract the token if it's prefixed with "Bearer "
    const extractedToken = token.startsWith("Bearer ") ? token.slice(7, token.length) : token;

    jwt.verify(extractedToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized: Invalid token." });
        }

        // Attach the decoded payload to the request object
        req.user = decoded;
        next();
    });
};

module.exports = {verifyToken};
