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

// Root URL (no GET / existed before — browsers showed "Cannot GET /")
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.redirect('/login');
});

// Web routes
app.use('/', webAuthRoutes);
app.use('/', webRecordRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use (EADDRINUSE).`);
    console.error(`   Either stop the other app using that port, or start with a different one, e.g.:`);
    console.error(`     PORT=3001 npm start   (Git Bash)`);
    console.error(`     $env:PORT=3001; npm start   (PowerShell)`);
    console.error(`   To find the PID on Windows: cmd.exe //c "netstat -ano | findstr :${PORT}"\n`);
    process.exit(1);
  }
  throw err;
});
