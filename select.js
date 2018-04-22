var fs = require('fs');
var db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

var result = db
  .filter(d => d.to.filter(f => f.indexOf('New York') >= 0).length > 0)
  .filter(d => d.count >= 100);

const minInterval = 10, minLength = 3600;
var count = 0;
var record = data => {
  if (data.length === 0) return;
  var time = (data[data.length - 1].time - data[0].time) / 1000;
  if (time >= minLength) {
    count++;
    console.log(`Id: ${count}, time: ${time}s`);
    fs.writeFileSync(`selected/${count}.json`, JSON.stringify(data));
  }
};

result.forEach(d => {
  var all = JSON.parse(fs.readFileSync(`merged/${d.id}.json`, 'utf8'));
  var pos = [];
  all.forEach(i => {
    if (i.PosTime && i.Lat && i.Long)
      pos.push({
        time: i.PosTime,
        lat: i.Lat,
        long: i.Long
      });
    if (i.Cos)
      for (var j = 0; j < i.Cos.length; j += 4)
        pos.push({
          time: i.Cos[j + 2],
          lat: i.Cos[j],
          long: i.Cos[j + 1]
        });
  });
  pos.sort((x, y) => x.time - y.time);
  var start = 0;
  for (var i = 1; i < pos.length; i++) {
    if (pos[i].time - pos[i - 1].time > minInterval * 1000) {
      record(pos.slice(start, i));
      start = i;
    }
  }
  record(pos.slice(start));
});

console.log("total flight: " + count);
