const jwt = require("jsonwebtoken");

const checkLogin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.error("Token verifikasi gagal:", err); 
        return res.status(403).json({ message: "Token anda tidak diizinkan." });
      }
      req.user = user;
      next();
    });
  } else {
    res
      .status(401)
      .json({ message: "Token tidak tersedia. Akses tidak diizinkan." });
  }
};

module.exports = checkLogin;
