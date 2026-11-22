// Official blood transfusion centres (RBC / NCBT network), one per province.
// Each centre serves the districts of its province, which is how we pick the "nearest" one.
// NOTE: centre-specific phone numbers must be confirmed with RBC before a public launch.
// Until then every centre lists the RBC toll-free line 114, which is a real, working number.
module.exports = [
  { name: 'National Centre for Blood Transfusion (NCBT)', city: 'Kigali', province: 'Kigali City', phone: '114' },
  { name: 'RCBT Huye', city: 'Huye', province: 'Southern', phone: '114' },
  { name: 'RCBT Karongi', city: 'Karongi', province: 'Western', phone: '114' },
  { name: 'RCBT Musanze', city: 'Musanze', province: 'Northern', phone: '114' },
  { name: 'RCBT Rwamagana', city: 'Rwamagana', province: 'Eastern', phone: '114' },
];
