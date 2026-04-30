// TODO: redirect to /login if req.session.user is not set
module.exports = (req, res, next) => {
  next();
};
