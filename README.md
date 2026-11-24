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
│   ├── seed.js / rcbtData.js # 30 sample donors and the RCBT centres
│   ├── middleware/           # HTTPS redirect, sessions, admin guard
│   ├── routes/               # donors, search, admin, meta
│   └── services/             # database logic
├── public/                   # pages, CSS and browser JavaScript
├── views/admin.html          # admin page, only served after login
├── scripts/seed.js           # reset or reload sample donors
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

Sample donors use phone numbers starting with `0700`, which no Rwandan network gives out, so nobody
real is called during testing.

### 7. Run the tests

```bash
npm test
```

The tests cover validation, registration, search limits, the 90-day rule, the RCBT fallback, admin
access control, password hashing, reporting, the removal log and translation coverage.

### Useful commands

| Command | What it does |
|---|---|
| `npm start` | Start the server |
| `npm run dev` | Start and restart on file changes |
| `npm test` | Run all tests |
| `npm run seed -- --reset` | Delete all donors and load the 30 sample donors again |

## Environment variables

All are optional locally. See `.env.example`.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `NODE_ENV` | - | Set to `production` on the live site (turns on HTTPS redirect and secure cookies) |
| `SESSION_SECRET` | random | Signs the admin session cookie |
| `ADMIN_USERNAME` | - | Optional. With `ADMIN_PASSWORD`, creates the first admin at start-up instead of on `/signup` |
| `ADMIN_PASSWORD` | - | Optional. First admin password (8+ characters). No default password exists |
| `SEED_DEMO` | `true` | Load the 30 sample donors when the donor table is empty |
| `DB_PATH` | `data/bloodlink.db` | Location of the SQLite file |

## Deploy for free on Render

1. Push this repository to GitHub (public).
2. Sign in at [render.com](https://render.com) with GitHub.
3. Click **New +** > **Blueprint**, choose this repository. Render reads `render.yaml`.
4. Leave `ADMIN_USERNAME` and `ADMIN_PASSWORD` empty and click **Apply**.
5. Wait for the build to finish and open the `https://bloodlink-rwanda-xxxx.onrender.com` link.
6. Go straight to `https://your-url.onrender.com/signup` and create your admin account. Do this as soon as
   the first deploy is live: the sign-up page is open to anyone until the first account exists, and it closes
   itself the moment you create it.
7. Put that link at the top of this README.

**Without the blueprint:** New + > Web Service > pick the repo > Build command `npm ci` >
Start command `npm start` > add the environment variables above with `NODE_ENV=production`.

**Free plan notes:** the app sleeps after 15 minutes without visitors, so the first visit can take
about a minute. The free disk is not permanent: after a restart the database starts fresh and the
30 sample donors are loaded again. For a real launch, add a Render persistent disk and set `DB_PATH`
to it, or move to a hosted database.

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
- The free hosting plan does not keep data between restarts (see above). After a restart with no persistent
  disk the admins table is empty again, so `/signup` reopens and the account has to be created once more.
- There is no "forgot password" flow yet. A locked-out admin is recovered by another admin, or by deleting the
  row from the `admins` table.

## Development process

Built with Agile sprints (see the project proposal):
Sprint 1 donor registration, Sprint 2 search and RCBT fallback, Sprint 3 trust and admin,
Sprint 4 Kinyarwanda, mobile layout and launch. Each sprint was developed on its own feature branch
and merged into `main` through a pull request.

## License

MIT
