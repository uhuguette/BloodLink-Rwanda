const app = require('./src/app');
const { seedDemoDonors, describeSeed } = require('./src/seed');

const PORT = process.env.PORT || 3000;

// Free hosts wipe the disk on restart, so the sample donors are refilled here.
// This also brings an existing database back into line when src/seed.js has
// been edited, which is how a local copy stops going stale. Donors who
// registered themselves are never touched. Set SEED_DEMO=false to turn it off.
if (process.env.SEED_DEMO !== 'false') {
  const summary = describeSeed(seedDemoDonors());
  if (summary) console.log(`Sample donors: ${summary}.`);
}

app.listen(PORT, () => {
  console.log(`BloodLink Rwanda is running on http://localhost:${PORT}`);
});
