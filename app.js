require('dotenv').config();
const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const session = require('express-session');
const { csrfSync } = require('csrf-sync');

const webAuthRoutes = require('./routes/webAuthRoutes');
const webRecordRoutes = require('./routes/webRecordRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Handlebars
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: {
    eq: (a, b) => a === b,
    formatDate: (date) => date ? new Date(date).toISOString().split('T')[0] : '',
    toFixed: (num, decimals) => (parseFloat(num) || 0).toFixed(typeof decimals === 'number' ? decimals : 2)
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Static assets & body parsers
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

// API routes — mounted before CSRF so they are not subject to CSRF validation
app.use('/api', apiRoutes);

// CSRF protection for all web routes mounted after this point
const { csrfSynchronisedProtection, generateToken } = csrfSync({
  getTokenFromRequest: (req) => req.body._csrf || req.headers['x-csrf-token']
});
app.use((req, res, next) => {
  res.locals.csrfToken = generateToken(req);
  next();
});
app.use(csrfSynchronisedProtection);

// Expose session user to every view
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Web routes
app.use('/', webAuthRoutes);
app.use('/', webRecordRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
