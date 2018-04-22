var fs = require('fs');

//var filtered = data.acList.filter(d => d.Lat !== undefined && d.Long != undefined)
// .filter(d => d.Lat !== -2147.483648 && d.Long !== -2147.483648);
var prefix = process.argv[2];

var aircrafts = {};
fs.readdirSync('data').filter(f => f.startsWith(prefix)).forEach(f => {
  var data = JSON.parse(fs.readFileSync(`data/${f}`, 'utf8'));
  data.acList.forEach(a => (aircrafts[a.Id] = aircrafts[a.Id] || []).push(a));
  console.log(f + ' processed.');
});

fs.mkdirSync(`planes/${prefix}`);
for (var i in aircrafts) fs.writeFileSync(`planes/${prefix}/${i}.json`, JSON.stringify(aircrafts[i]));
