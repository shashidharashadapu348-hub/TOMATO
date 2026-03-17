const { ensureDatabaseFile } = require('./database');

function migrate() {
  ensureDatabaseFile();
}

if (require.main === module) {
  migrate();
  console.log('Data store initialized.');
}

module.exports = { migrate };
