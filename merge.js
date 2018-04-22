var fs = require('fs');
var planes = {};
var all = fs.readdirSync('planes').map(f => `planes/${f}`);
all.forEach(h => fs.readdirSync(h).forEach(a => planes[a] = 1));

for (var a in planes) {
  var merged = all
    .filter(h => fs.existsSync(`${h}/${a}`))
    .map(h => JSON.parse(fs.readFileSync(`${h}/${a}`, 'utf8')))
    .reduce((p, c) => p.concat(c), []);
  fs.writeFileSync(`merged/${a}`, JSON.stringify(merged));
}
