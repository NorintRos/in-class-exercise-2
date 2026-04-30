const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const recordModel = require("../models/recordModel");

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret";

exports.login = async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  const user = await userModel.findByUsername(username);
  if (!user) return res.status(401).json({ error: "invalid credentials" });

  const ok = await userModel.validatePassword(user, password);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
};

exports.getRecords = async (req, res) => {
  // jwtAuth middleware should set req.user
  if (!req.user || !req.user.id)
    return res.status(401).json({ error: "unauthorized" });

  const records = await recordModel.findAll(req.user.id);
  res.json(records || []);
};
