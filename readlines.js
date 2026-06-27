const fs = require('fs');
const path = require('path');
const lines = fs.readFileSync(path.join(__dirname, 'src/CUS360Demo.jsx'), 'utf8').split('\n');
// Show lines around both login buttons (14290-14312)
for (let i = 14288; i < Math.min(14315, lines.length); i++) {
  console.log((i + 1) + ': ' + lines[i]);
}
