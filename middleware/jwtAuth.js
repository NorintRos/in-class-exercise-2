// TODO: verify JWT from Authorization Bearer header, attach decoded payload to req.user
module.exports = (req, res, next) => {
  next();
};
