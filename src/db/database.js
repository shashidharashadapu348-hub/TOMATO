const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'data', 'tomato-store.json');

function baseState() {
	return {
		counters: {
			users: 0,
			contacts: 0,
			orders: 0
		},
		users: [],
		contacts: [],
		carts: [],
		orders: []
	};
}

function ensureDatabaseFile() {
	const dir = path.dirname(dbPath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	if (!fs.existsSync(dbPath)) {
		fs.writeFileSync(dbPath, JSON.stringify(baseState(), null, 2));
	}
}

function readData() {
	ensureDatabaseFile();
	return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeData(data) {
	ensureDatabaseFile();
	fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function nextId(data, key) {
	data.counters[key] += 1;
	return data.counters[key];
}

module.exports = { readData, writeData, ensureDatabaseFile, nextId };
