require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

// TODO: configure express-handlebars engine
// TODO: configure express.static, urlencoded, json body parsers
// TODO: configure express-session
// TODO: mount /api routes (before CSRF so API is exempt)
// TODO: configure csrf-sync protection
// TODO: attach res.locals.csrfToken and res.locals.user per request
// TODO: mount web routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
