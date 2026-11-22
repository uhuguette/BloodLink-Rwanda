const app = require('./src/app');
const { seedDemoDonors } = require('./src/seed');

const PORT = process.env.PORT || 3000;

// Free hosts wipe the disk on restart, so refill the sample donors when the
// database is empty. Set SEED_DEMO=false to turn this off.
if (process.env.SEED_DEMO !== 'false') {
  const added = seedDemoDonors();
  if (added) console.log(`Added ${added} sample donors.`);
}

app.listen(PORT, () => {
  console.log(`BloodLink Rwanda is running on http://localhost:${PORT}`);
});
