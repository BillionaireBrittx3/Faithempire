// This script reads text from the read tool's output which was piped here
const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8');
fs.writeFileSync('server/data/genesis-raw.txt', raw);
console.error('Wrote ' + raw.length + ' chars to server/data/genesis-raw.txt');
