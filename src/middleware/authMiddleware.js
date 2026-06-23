

const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {

  const authHeader = req.headers["authorization"];

  console.log("HEADER:", authHeader);

  const token = authHeader && authHeader.split(" ")[1];

  console.log("TOKEN:", token);

  if (!token) {
    return res.status(401).json({
      message: "Access token required"
    });
  }

  jwt.verify(
  token,
  process.env.JWT_SECRET,
  (err, user) => {

    if (err) {
      return res.status(403).json({
        message: "Invalid token"
      });
    }

    console.log("DECODED USER:", user);

    req.user = user;

    next();
  }
);
}

module.exports = authenticateToken;