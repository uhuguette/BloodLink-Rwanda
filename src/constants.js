// Blood groups a donor can pick from (FR 1.1).
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// The 30 districts of Rwanda, grouped by province.
// The province is used to point a seeker to the nearest RCBT.
const PROVINCES = {
  'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  Southern: ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  Western: ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
  Northern: ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  Eastern: ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
};

const DISTRICTS = Object.values(PROVINCES).flat().sort();

function provinceOf(district) {
  return Object.keys(PROVINCES).find((p) => PROVINCES[p].includes(district)) || null;
}

const MAX_RESULTS = 20;          // NFR 5
const RECONFIRM_DAYS = 90;       // donors not reconfirmed in 90 days are hidden
const REPORTS_TO_HIDE = 2;       // two reports hide a donor for review

module.exports = {
  BLOOD_TYPES,
  PROVINCES,
  DISTRICTS,
  provinceOf,
  MAX_RESULTS,
  RECONFIRM_DAYS,
  REPORTS_TO_HIDE,
};
