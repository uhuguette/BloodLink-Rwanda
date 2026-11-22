// Usage: npm run seed            -> adds sample donors if the table is empty
//        npm run seed -- --reset -> deletes all donors and adds the samples again
const { seedDemoDonors } = require('../src/seed');

const added = seedDemoDonors({ reset: process.argv.includes('--reset') });
console.log(added ? `Added ${added} sample donors.` : 'Donors already exist. Use --reset to start over.');
