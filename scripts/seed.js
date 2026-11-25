// Usage: npm run seed             -> bring the sample donors in line with src/seed.js
//        npm run seed -- --force   -> re-sync them even if nothing has changed
//        npm run seed -- --reset   -> delete EVERY donor, real ones included, and start over
//
// Without --reset, people who registered themselves are never touched.
const { seedDemoDonors, describeSeed } = require('../src/seed');

const reset = process.argv.includes('--reset');
const result = seedDemoDonors({ reset, force: process.argv.includes('--force') });

if (result.upToDate) {
  console.log('Sample donors are already up to date. Use --force to re-sync, or --reset to start over.');
} else {
  console.log(`Sample donors: ${describeSeed(result) || 'no changes needed'}.`);
}
if (result.skipped.length) {
  console.log(`Skipped: ${result.skipped.join(', ')}`);
}
