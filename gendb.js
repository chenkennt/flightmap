var fs = require('fs');

var distinct = (list, selector) => list.map(i => selector(i)).filter((v, i, self) => v !== undefined && self.indexOf(v) === i);
var db = [];
fs.readdirSync('merged').forEach((a, i) => {
  var id = a.slice(0, -5);
  var data = JSON.parse(fs.readFileSync(`merged/${a}`, 'utf8'));
  var from = distinct(data, d => d.From);
  var to = distinct(data, d => d.To);
  db.push({
    id: id,
    from: from,
    to: to,
    count: data.length
  });
  if (i % 1000 === 0) console.log(i + ' processed');
});

fs.writeFileSync('db.json', JSON.stringify(db));
