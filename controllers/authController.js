const userModel = require("../models/userModel");

exports.getLogin = (req, res) => {
  res.render("login", {
    title: "Login",
    csrfToken: req.csrfToken(),
    user: req.session.user,
  });
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findByUsername(username);
  if (!user) {
    return res
      .status(401)
      .render("login", {
        title: "Login",
        error: "Invalid credentials",
        csrfToken: req.csrfToken(),
      });
  }

  const ok = await userModel.validatePassword(user, password);
  if (!ok) {
    return res
      .status(401)
      .render("login", {
        title: "Login",
        error: "Invalid credentials",
        csrfToken: req.csrfToken(),
      });
  }

  req.session.user = { id: user.id, username: user.username };
  res.redirect("/dashboard");
};

exports.getRegister = (req, res) => {
  res.render("register", {
    title: "Register",
    csrfToken: req.csrfToken(),
    user: req.session.user,
  });
};

exports.postRegister = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await userModel.create({ username, password });
    req.session.user = { id: user.id, username: user.username };
    res.redirect("/dashboard");
  } catch (err) {
    res
      .status(400)
      .render("register", {
        title: "Register",
        error: err.message || "Unable to register",
        csrfToken: req.csrfToken(),
      });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
