const fs = require('fs');
const path = require('path');
const lines = fs.readFileSync(path.join(__dirname, 'src/CUS360Demo.jsx'), 'utf8').split('\n');
// Find AUMChart definition - show lines 270-350
for (let i = 269; i < Math.min(350, lines.length); i++) {
  console.log((i + 1) + ': ' + lines[i]);
}
