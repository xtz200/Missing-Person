const jwt = require("jsonwebtoken");

function authenticateUser(req, res, next) {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
}

module.exports = authenticateUser;

//JWT Toekn checks whhether it's valid or not in the Authorization heaader. If it's valid, it'll work otherwise it wont.