const {auth} = require("./config/firebase");
const verifyToken = async (req, res, next) => {const token = req.headers["authorization"];
  if (!token) return res.status(403).send("Token is required");
  try {const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();} catch (error) {res.status(401).send("Invalid token");}};
module.exports = {verifyToken};
