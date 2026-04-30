# Team Plan — Vehicle Fuel Consumption Manager

## Project Scaffold

```
fuel-manager/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── controllers/
│   ├── authController.js        ← Member B
│   ├── recordController.js      ← Member C
│   └── apiController.js         ← Member B
├── middleware/
│   ├── sessionAuth.js           ← Member A
│   └── jwtAuth.js               ← Member A
├── models/
│   ├── userModel.js             ← Member A  (schema; B & C consume)
│   └── recordModel.js           ← Member A  (schema + stats logic; C consumes)
├── routes/
│   ├── webAuthRoutes.js         ← Member B
│   ├── webRecordRoutes.js       ← Member C
│   └── apiRoutes.js             ← Member B
├── views/
│   ├── layouts/
│   │   └── main.hbs             ← Member B
│   ├── login.hbs                ← Member B
│   ├── register.hbs             ← Member B
│   ├── dashboard.hbs            ← Member C
│   ├── add-record.hbs           ← Member C
│   ├── edit-record.hbs          ← Member C
│   └── stats.hbs                ← Member C
├── public/
│   └── css/
│       └── style.css            ← Member C
├── app.js                       ← Member A
├── .env.example                 ← Member A
├── .gitignore                   ← Member A
├── package.json                 ← Member A
└── README.md                    ← Member A
```

---

## Member A — Foundation + Models + Middleware

**Branch:** `feature/a/foundation`
**Owns:** `app.js`, `package.json`, `.env.example`, `.gitignore`, `models/`, `middleware/`

**Tasks:**
1. Init project, install all deps → `package.json`
2. Configure Express, HBS engine, session, CSRF, route mounting → `app.js`
3. In-memory user store + bcrypt helpers → `models/userModel.js`
4. In-memory record store + km/L calc + weekly/monthly grouping → `models/recordModel.js`
5. Session guard → `middleware/sessionAuth.js`
6. JWT verify → `middleware/jwtAuth.js`

**Depends on:** nothing — starts and merges first
**Others depend on this:** B and C both wait for PR #1 before branching

---

## Member B — Auth + API + Auth Views

**Branch:** `feature/b/auth-api`
**Owns:** `controllers/authController.js`, `controllers/apiController.js`, `routes/webAuthRoutes.js`, `routes/apiRoutes.js`, `views/layouts/main.hbs`, `views/login.hbs`, `views/register.hbs`

**Tasks:**
1. Register / Login / Logout logic → `controllers/authController.js`
2. Auth web routes (GET/POST /login, /register, /logout) → `routes/webAuthRoutes.js`
3. API login endpoint that returns JWT → `controllers/apiController.js`
4. API routes (`POST /api/login`, `GET /api/records`) → `routes/apiRoutes.js`
5. HBS layout shell + nav bar with CSRF logout button → `views/layouts/main.hbs`
6. Login and Register pages → `views/login.hbs`, `views/register.hbs`

**Depends on:** PR #1 (Member A) merged
**Can run in parallel with:** PR #3 (Member C) — zero file overlap
**Note:** Coordinate with C early on the `main.hbs` layout structure so C's views extend it correctly

---

## Member C — Records CRUD + Views + Styles

**Branch:** `feature/c/records-views`
**Owns:** `controllers/recordController.js`, `routes/webRecordRoutes.js`, `views/dashboard.hbs`, `views/add-record.hbs`, `views/edit-record.hbs`, `views/stats.hbs`, `public/css/style.css`

**Tasks:**
1. Full CRUD controller for web UI → `controllers/recordController.js`
   - `getDashboard`, `getAddRecord`, `postAddRecord`, `getEditRecord`, `postUpdateRecord`, `deleteRecord`, `getStats`
2. Web record routes (protected by `sessionAuth`) → `routes/webRecordRoutes.js`
3. Dashboard table with Edit/Delete actions → `views/dashboard.hbs`
4. Add-record form with CSRF token → `views/add-record.hbs`
5. Edit-record form with CSRF token → `views/edit-record.hbs`
6. Weekly + Monthly stats tables → `views/stats.hbs`
7. Styles for all pages → `public/css/style.css`

**Depends on:** PR #1 (Member A) merged
**Can run in parallel with:** PR #2 (Member B) — zero file overlap
**Note:** Ask B for the `main.hbs` layout variable names (`{{csrfToken}}`, `{{user}}`) before building forms

---

## Shared Interface Contract

Member A defines these. B and C must not modify them.

**`models/userModel`**
`findByUsername(username)`, `findById(id)`, `create({username, password})`, `validatePassword(user, password)`

**`models/recordModel`**
`findAll(userId)`, `findById(id, userId)`, `create({userId, date, vehicleType, liters, distanceKm, totalCost})`, `update(id, userId, data)`, `delete(id, userId)`, `getWeeklyStats(userId)`, `getMonthlyStats(userId)`

Record shape: `{ id, userId, date, vehicleType, liters, distanceKm, totalCost, kmPerLiter }`

---

## Git Workflow

### Branch naming
```
main
├── feature/a/foundation        ← merges first
├── feature/b/auth-api          ← branches after PR #1 merges
└── feature/c/records-views     ← branches after PR #1 merges
```

### Commit convention
```
chore(setup):  initialize project and install dependencies
feat(models):  add user and record in-memory models
feat(auth):    implement session login, register, logout
feat(api):     add JWT login and protected GET /api/records
feat(records): implement fuel record CRUD controller
feat(views):   add dashboard, add/edit forms, stats page
```

---

## PR Sequence (Conflict-Free Merge Order)

```
PR #1 — Member A: Foundation + Models + Middleware         [~0:15]
  Branch:  feature/a/foundation
  Files:   app.js, package.json, .env.example, .gitignore,
           models/userModel.js, models/recordModel.js,
           middleware/sessionAuth.js, middleware/jwtAuth.js
  → MUST merge before B or C open their PRs
  Reviewer: B or C

PR #2 — Member B: Auth + API + Auth Views                  [~0:50]
  Branch:  feature/b/auth-api
  Depends on: PR #1 merged
  Can merge in parallel with: PR #3 (no overlapping files)
  Reviewer: C

PR #3 — Member C: Records + Views + Styles                 [~0:50]
  Branch:  feature/c/records-views
  Depends on: PR #1 merged
  Can merge in parallel with: PR #2 (no overlapping files)
  Reviewer: B
```

---

## Anti-Conflict Rules

1. **No cross-ownership edits.** B and C must not touch `app.js`, `models/`, or `middleware/`. Route mounting lives in `app.js` — only A edits it.
2. **Rebase before opening PR.** `git fetch origin main && git rebase origin/main` before every PR.
3. **Rebase after PR #1 merges.** B and C both run `git rebase origin/main` immediately after PR #1 lands.
4. **Layout contract is fixed before B starts coding.** B writes `main.hbs` first (15 minutes in); C waits to confirm the variable names (`{{csrfToken}}`, `{{user.username}}`) before building forms.
5. **Model changes go through A.** If B or C needs a new model method, A adds it as a new commit on the foundation branch (or a fast-follow PR). No one else touches model files.

---

## 90-Minute Sprint Timeline

| Time | A | B | C |
|------|---|---|---|
| 0–20m | Setup + models + middleware → open PR #1 | Review A's PR | Review A's PR |
| 20m | Merge PR #1, share branch point | Branch off main | Branch off main |
| 20–55m | Help review + assist | auth controllers, API, auth views | record controller, CRUD views, styles |
| 55–65m | — | Open PR #2 | Open PR #3 |
| 65–75m | — | Review PR #3 | Review PR #2 |
| 75–80m | — | Merge PR #2 & #3 | Merge PR #2 & #3 |
| 80–90m | Final `npm start` smoke test + checklist | | |

---

## Pre-Submission Checklist

- [ ] `npm start` runs without errors
- [ ] Register → Login flow works (session created)
- [ ] CSRF token present in every form's page source
- [ ] Add / Edit / Delete a fuel record works end-to-end
- [ ] `POST /api/login` returns `{ token: "..." }`
- [ ] `GET /api/records` returns 401 without token; returns data with valid Bearer token
- [ ] Stats page shows weekly and monthly cost totals
- [ ] `.env.example` committed, `.env` in `.gitignore`
- [ ] At least 1 merged PR per member (A, B, C) visible in git history
