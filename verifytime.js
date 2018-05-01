var fs = require('fs');

var prev;
fs.readdirSync('data').forEach(f => {
  var curr = Number.parseInt(f.slice(0, -5));
  if (prev && curr - prev > 16 * 1000) console.log(`Missing data between ${prev} and ${curr}, gap ${curr - prev}`);
  prev = curr;
});
