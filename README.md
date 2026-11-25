# BloodLink Rwanda

**Find a willing blood donor by blood type and district, and call them directly.**

In Rwanda, blood moves through RBC / NCBT from one institution to another. When a family needs a donor
urgently (especially for a rare type like AB-) or outside office hours, they have no way to search for one
themselves. They post in WhatsApp groups and hope the right person sees it in time.
BloodLink Rwanda fills that gap: donors register their blood type, district and phone number, and seekers
search and call them. When nobody matches, the site points them to the nearest official blood centre (RCBT).
It works **alongside** RBC, not instead of it.

- **Live demo:** _add your Render URL here after deploying_
- **Demo video:** _add your video link here_
- **SRS document:** _add the link to your SRS here_
- **Author:** Uwase Huguette, African Leadership University

---

## Features

| SRS ref | Feature |
|---|---|
| FR 1 | Donor registration: name, blood type, district, Rwandan phone (10 digits starting 07), required consent. Same phone number = update and reconfirm, not a duplicate. |
| FR 2 | Search by blood type and district, three actions only. Hidden or outdated donors are never shown. |
| FR 3 | Up to 20 results with first name, blood type, district, phone (tap to call) and last confirmed date. "Number not working?" report button on each result. |
| FR 3.2 / FR 4 | No match: clear message and RCBT contacts, nearest centre first. Separate Blood Centres page. |
| FR 5 | Admin sign-up (the first administrator creates their own account), admin login, full donor list with flagged donors marked, remove or keep, removal log. |
| Trust rules | Donors not reconfirmed in 90 days, or reported by 2 different visitors, are hidden until reviewed. |
| NFR 1-3 | Admin pages blocked without login ("access denied"), bcrypt-hashed passwords (8+ chars), 15-minute session timeout, every removal logged with admin, donor ID and time. |
| NFR 4-5 | Only the data needed is stored, only first names are shown, max 20 results, no export. |
| NFR 6 | HTTP redirects to HTTPS in production. |
| NFR 10-12 | English / Kinyarwanda switch on every page, phone-first layout with no sideways scrolling at 360 px. |
| SRS 2.6 | Help / FAQ page in both languages. |

### Design

The look is inspired by **Imigongo**, the geometric art from eastern Rwanda: black, clay and cream
zigzag bands, with blood red as the accent. Blood types are picked by tapping a blood-drop button.

## SRS requirement coverage

Every requirement in the SRS, where it lives in the code, and how it is checked.

### Functional requirements

| Req | Requirement | Where it lives | How it is checked |
|---|---|---|---|
| FR 1.1 | Collect name, phone, blood type, district, consent tick | `public/register.html`, `src/routes/donors.js` | `donors.api.test.js` - "registers a new donor" |
| FR 1.2 | Reject invalid Rwandan numbers; same number updates instead of duplicating | `src/validators.js`, `src/services/donorService.js` | `validators.test.js`, "same phone number updates instead of duplicating" |
| FR 1.3 | Save with registration date and last-confirmed date | `src/db.js` (`registered_at`, `last_confirmed_at`) | `donors.api.test.js` |
| FR 2.1 | Filter by blood type | `public/index.html`, `GET /api/search` | `search.api.test.js` |
| FR 2.2 | Filter by district | `public/index.html`, `GET /api/search` | `search.api.test.js` |
| FR 2.3 | Inactive donors never appear | `src/services/searchService.js` | "donors not reconfirmed in 90 days are hidden" |
| FR 3.1 | Up to 20 donors: first name, type, district, phone, last confirmed | `public/results.html`, `MAX_RESULTS` | "never returns more than 20 donors" |
| FR 3.2 | No results: message plus nearest RCBT contacts | `src/routes/search.js` | "no match returns RCBT contacts with the nearest centre first" |
| FR 3.3 | Report button on every result | `public/js/results.js`, `src/services/reportService.js` | "two reports from different visitors hide a donor" |
| FR 4.1 | List of official RCBT centres with contacts | `public/centres.html`, `src/rcbtData.js` | `search.api.test.js` |
| FR 5.1 | Admin signs in with username and password | `public/login.html`, `public/signup.html`, `src/services/adminService.js` | `signup.api.test.js`, "wrong password gives access denied" |
| FR 5.2 | Admin sees the full list with flagged donors marked | `views/admin.html`, `listDonors()` | "admin logs in and sees the flagged donor" |
| FR 5.3 | Admin removes flagged or invalid donors after review | `removeDonor()`, `keepDonor()` | `admin.api.test.js` |

### Non-functional requirements

| Req | Requirement | Where it lives | How it is checked |
|---|---|---|---|
| NFR 1 | Admin pages and APIs blocked without login | `src/middleware/requireAdmin.js` | "NFR 1: admin API and page are blocked without login" |
| NFR 2 | Password hashed, 8+ characters, 15-minute session timeout | `adminService.js` (bcrypt, 12 rounds), `middleware/security.js` | "NFR 2: admin password is stored as a hash", `signup.api.test.js` |
| NFR 3 | Every removal logged with admin, donor ID and time | `removal_log` table | "NFR 3: removing a donor writes a log entry..." |
| NFR 4 | Only the four fields collected, consent mandatory | `src/validators.js` | "no consent means no sign up" |
| NFR 5 | Max 20 results, first names only, no public export | `searchService.js` | "finds a matching donor and shows only the first name", `performance.test.js` |
| NFR 6 | HTTP redirects to HTTPS | `middleware/security.js` (`forceHttps`) | By hand on the live URL - only active when `NODE_ENV=production` |
| NFR 7 | Search under 2 s with 1,000 donors (19 of 20) | `searchService.js`, index on `(blood_type, district, status)` | `performance.test.js` + `npm run benchmark` - **20 of 20, median 5.8 ms** |
| NFR 8 | 50 people at once, answered within 3 s | Express + SQLite WAL mode | `performance.test.js` + `npm run benchmark` - **50 of 50 in 203 ms** |
| NFR 9 | Register in under 2 minutes, search in under 1 | Three-step forms, no account needed to search | **Needs people** - watch 4 users, unassisted |
| NFR 10 | At most 3 actions to search, readable at 360 px | `public/index.html`, `public/css/style.css` | Checked by hand at 360 px; **needs people** for the 3-action count |
| NFR 11 | English and Kinyarwanda, one button on every page | `public/js/i18n.js`, `public/js/layout.js` | "every English text has a Kinyarwanda version and the other way round" |
| NFR 12 | Chrome and Firefox, Android and desktop, no sideways scroll at 360 px | Responsive CSS, no framework | Checked by hand at 360 px |

**Still open:** NFR 9 and the 3-action count in NFR 10 are usability tests that need real people, and NFR 6
can only be shown on the deployed HTTPS URL. Everything else above runs automatically with `npm test`.

## Tech stack

- **Front end:** HTML, CSS, plain JavaScript (no framework, no build step)
- **Back end:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`), a single file, no database server needed
- **Other:** `express-session` (admin sessions), `bcryptjs` (password hashing)
- **Tests:** Node's built-in test runner (`node --test`)

## Project structure

```
BloodLink-Rwanda/
├── server.js                 # starts the app, seeds sample donors
├── src/
│   ├── app.js                # Express app and routes
│   ├── db.js                 # SQLite tables: donors, reports, admins, removal_log, rcbt_centres
│   ├── constants.js          # blood types, 30 districts, provinces, limits
│   ├── validators.js         # donor validation (phone, consent...)
│   ├── seed.js / rcbtData.js # 30 sample donors (kept in sync) and the RCBT centres
│   ├── loadTestData.js       # builds 1,000 donors for the NFR 7 / NFR 8 checks
│   ├── middleware/           # HTTPS redirect, sessions, admin guard
│   ├── routes/               # donors, search, admin, meta
│   └── services/             # database logic
├── public/                   # pages, CSS and browser JavaScript
├── views/admin.html          # admin page, only served after login
├── scripts/seed.js           # reset or reload sample donors
├── scripts/benchmark.js      # prints the NFR 7 and NFR 8 performance figures
└── test/                     # automated tests
```

## Run it on your computer

### 1. Install the requirements

- [Node.js](https://nodejs.org/) **version 18 or newer** (20 LTS recommended). Check with:
  ```bash
  node -v
  ```
- [Git](https://git-scm.com/downloads)

### 2. Get the code

```bash
git clone https://github.com/uhuguette/BloodLink-Rwanda.git
cd BloodLink-Rwanda
```

### 3. Install the packages

```bash
npm install
```

### 4. Start the app

```bash
npm start
```

Open **http://localhost:3000** in your browser. On the first start the app creates `data/bloodlink.db`,
adds the official blood centres and **30 sample donors**.

For development, `npm run dev` restarts the server every time you save a file.

### 5. Create your admin account, then log in

There is **no default password**. The first administrator signs up with credentials of their own choosing.

1. Go to **http://localhost:3000/signup** (the login page also links to it while no admin exists).
2. Pick a username (3-32 characters: letters, numbers, `.`, `-`, `_`) and a password of at least 8 characters.
3. Press **Create admin account**. You are signed in straight away and land on `/admin`.

After that the sign-up page is closed: it only answers a visitor who is already signed in as an admin, so
an existing admin can add a colleague from the **Add administrator** button on the dashboard. Everyone else
is sent to **http://localhost:3000/login** (or the **Admin login** button in the footer).

Passwords are stored as bcrypt hashes with 12 rounds and are never written to the database in plain text.

If you would rather have the account created for you at start-up (useful for an automated deploy), set
**both** `ADMIN_USERNAME` and `ADMIN_PASSWORD` before the first run. When either is missing, nothing is
created and the sign-up page stays open for the first admin.

### 6. Try it out

| Try this | What you should see |
|---|---|
| Search **O+** in **Gasabo** | 2 donors (Aline, Eric) |
| Search **AB-** in **Rusizi** | "No donor found" and the RCBT list, with **RCBT Karongi** marked nearest |
| Register with phone `12345` or without ticking consent | A clear error, nothing saved |
| Register again with the same phone number | "Welcome back", record updated instead of duplicated |
| Open `/admin` without logging in | Sent to the login page with "Access denied" |
| Open `/signup` before any admin exists | The sign-up form, which creates your admin account |
| Open `/signup` again, logged out | "An admin account already exists. Please log in." |
| Sign up with a 5-letter password, or two passwords that differ | A clear error, no account created |
| Log in as admin | Gilbert and Nadine are flagged (not reconfirmed in 90 days) |
| Remove a donor | It disappears and a line is added to the removal log |
| Press **Kinyarwanda** in the header | Every label on the page changes language |

> **The 30 sample donors are invented.** Their names and phone numbers were made up. The numbers use the
> real Rwandan mobile prefixes (078 / 079 for MTN, 072 / 073 for Airtel) so the demo looks like the real
> thing, which means a sample number could by chance belong to a real subscriber. **Please do not call
> them.** The Help page says the same thing to visitors, in English and Kinyarwanda. Nothing dials by
> itself: a number is only called if someone taps it. To run the site with an empty donor list instead,
> set `SEED_DEMO=false`.

**Sample donors stay in step with the code.** Each donor row is marked as sample data or as a real
registration, and the app stores a fingerprint of the sample list. When `src/seed.js` is edited, the next
start-up notices the fingerprint has changed and rewrites the sample rows to match: no need to delete the
database. Donors who registered themselves are never read, changed or removed by this. Only
`npm run seed -- --reset` touches them, and it says so. A sample donor that an admin removed earlier comes
back on the next re-sync, because a re-sync restores the demo data to what the code says it should be.

### 7. Run the tests

```bash
npm test
```

33 tests cover validation, registration, search limits, the 90-day rule, the RCBT fallback, admin
sign-up and access control, password hashing, reporting, the removal log, translation coverage and the
two performance requirements.

### 8. Check the performance requirements

```bash
npm run benchmark
```

This builds a throwaway database of **1,000 donors**, runs the two tests exactly as the SRS describes them
and prints the figures. It never touches your own database.

| | Requirement | Measured |
|---|---|---|
| **NFR 7** | 20 searches with 1,000 donors, at least 19 under 2 s | **20 of 20 passed** - median 5.8 ms, slowest 108 ms |
| **NFR 8** | 50 people searching at once, each answered within 3 s | **50 of 50 passed** - all answered in 203 ms, slowest 178 ms |

Measured on a laptop with Node 20. The same two checks also run as part of `npm test`
(`test/performance.test.js`), so they fail the build if a change ever makes search slow.

### Useful commands

| Command | What it does |
|---|---|
| `npm start` | Start the server |
| `npm run dev` | Start and restart on file changes |
| `npm test` | Run all tests |
| `npm run benchmark` | Measure NFR 7 and NFR 8 and print the table above |
| `npm run seed` | Bring the sample donors in line with `src/seed.js` (leaves real registrations alone) |
| `npm run seed -- --force` | Re-sync the sample donors even if nothing changed |
| `npm run seed -- --reset` | **Deletes every donor, real ones included**, then loads the samples again |

## Environment variables

All are optional locally. See `.env.example`.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `NODE_ENV` | - | Set to `production` on the live site (turns on HTTPS redirect and secure cookies) |
| `SESSION_SECRET` | random | Signs the admin session cookie |
| `ADMIN_USERNAME` | - | Optional locally, **set it on a host with no persistent disk**. With `ADMIN_PASSWORD`, recreates the admin at every start-up instead of waiting for `/signup` |
| `ADMIN_PASSWORD` | - | The admin password (8+ characters). There is no default password: without this the account is only created through `/signup` |
| `SEED_DEMO` | `true` | Load the 30 sample donors when the donor table is empty |
| `DB_PATH` | `data/bloodlink.db` | Location of the SQLite file |

## Deploy for free on Render

1. Push this repository to GitHub (public).
2. Sign in at [render.com](https://render.com) with GitHub.
3. Click **New +** > **Blueprint**, choose this repository. Render reads `render.yaml`.
4. Render asks for two values. Type the **username** and **password** you want to administer the site
   with (password: 8 characters or more). Nothing else needs filling in: `SESSION_SECRET` is generated
   by Render, and everything else already has a value. Click **Apply**.
5. The first build takes 2-4 minutes, mostly compiling `better-sqlite3`. Wait for **Live**, then open the
   `https://bloodlink-rwanda-xxxx.onrender.com` link.
6. Check it: `https://your-url.onrender.com/api/health` should answer `{"ok":true,...}`, and
   `http://your-url.onrender.com` (plain http) should jump to `https://` (NFR 6).
7. Log in at `https://your-url.onrender.com/login` with the username and password from step 4.
8. Put the link at the top of this README, next to **Live demo**.

**Why the admin details go in the blueprint.** The free plan has no persistent disk. The instance spins
down after about 15 minutes without visitors, and the filesystem is wiped whenever it starts again or
redeploys, so `data/bloodlink.db` does not survive. With `ADMIN_USERNAME` and `ADMIN_PASSWORD` set,
the admin account is recreated from them on every cold start, so your login keeps working and `/signup`
stays closed. Without them the site would come back with no admin at all, and the sign-up page would
reopen to whoever visited next. `SEED_DEMO=true` reloads the 30 sample donors for the same reason, so
the site is never empty when somebody opens it.

To demonstrate the sign-up flow instead, run it locally (`npm start` with no `ADMIN_*` set, then
`/signup`), or deploy once without the two variables, sign up, and add them afterwards in
**Environment** in the Render dashboard.

**Without the blueprint:** New + > Web Service > pick the repo > Build command `npm ci` >
Start command `npm start` > add the environment variables above with `NODE_ENV=production`.

**Free plan notes:** the app sleeps after 15 minutes without visitors, so the first visit can take
about a minute. Sessions are held in memory, so a restart also logs the admin out; logging in again is
all that is needed. For a real launch, add a Render persistent disk and set `DB_PATH` to it, or move to
a hosted database.

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/meta` | Blood types and districts |
| `POST` | `/api/donors` | Register or reconfirm a donor |
| `POST` | `/api/donors/:id/report` | Report a number that does not work |
| `GET` | `/api/search?bloodType=O-&district=Gasabo` | Up to 20 donors, or RCBT contacts if none |
| `GET` | `/api/rcbt?district=Huye` | Blood centres, nearest first |
| `GET` | `/api/admin/setup` | Whether the site still needs its first admin |
| `POST` | `/api/admin/signup` | Create the first admin, or add one while signed in |
| `POST` | `/api/admin/login` / `logout` | Admin session |
| `GET` | `/api/admin/donors` | All donors with flags (admin only) |
| `DELETE` | `/api/admin/donors/:id` | Remove a donor and log it (admin only) |
| `POST` | `/api/admin/donors/:id/keep` | Clear reports and keep the donor (admin only) |
| `GET` | `/api/admin/log` | Removal log (admin only) |

## Known limitations

- RCBT centres currently list the RBC toll-free line **114**. Each centre's direct number must be confirmed with RBC before a public launch.
- The Kinyarwanda translations should be reviewed by two native speakers (planned in Sprint 4).
- Blood types are self-reported. There is no medical verification in this MVP.
- Before a real public launch, BloodLink must comply with Rwanda's data protection law (Law No. 058/2021), because it stores phone numbers.
- The free hosting plan does not keep data between restarts (see above). Donors registered on the live site
  are lost when the instance restarts, which is why the 30 sample donors are reloaded automatically. Setting
  `ADMIN_USERNAME` and `ADMIN_PASSWORD` keeps the admin account working across restarts; without them the
  admins table comes back empty and `/signup` reopens to the next visitor.
- There is no "forgot password" flow yet. A locked-out admin is recovered by another admin, or by deleting the
  row from the `admins` table.

## Development process

Built with Agile sprints (see the project proposal):
Sprint 1 donor registration, Sprint 2 search and RCBT fallback, Sprint 3 trust and admin,
Sprint 4 Kinyarwanda, mobile layout and launch. Each sprint was developed on its own feature branch
and merged into `main` through a pull request.

## License

MIT
