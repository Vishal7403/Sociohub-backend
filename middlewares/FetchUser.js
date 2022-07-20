const jwt = require("jsonwebtoken");
require("dotenv").config();
const FetchUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(400)
      .json({ error: "please authenticate using valid token" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
  } catch (err) {
    return res
      .status(400)
      .json({ error: "please authenticate using valid token", message: err });
  }
  next();
};
module.exports = { FetchUser };
