var fs = require('fs');

var interval = 5 * 1000;;
var input = process.argv[2];
var result = [];
var count = 0;
var dist = (x, y) => Math.sqrt((x.lat - y.lat) * (x.lat - y.lat) + (x.long - y.long) * (x.long - y.long));
fs.readdirSync(input).forEach(f => {
  var data = JSON.parse(fs.readFileSync(`${input}/${f}`, 'utf8'));
  var time = Math.ceil(data[0].time / interval) * interval;
  var last;
  var normalized = [];
  data.forEach(d => {
    for (; time <= d.time; time += interval) {
      var ratio = (time - last.time) / (d.time - last.time);
      normalized.push({
        time: time,
        lat: last.lat + (d.lat - last.lat) * ratio,
        long: last.long + (d.long - last.long) * ratio
      });
    }
    last = d;
  });

  // remove planes that moves too slow
  var totalDist = dist(normalized[0], normalized[normalized.length - 1]);
  if (totalDist < 1) {
    console.error("plane too slow: " + totalDist);
    
    return;
  }
  for (var i = 0; i < normalized.length - 1; i++) {
    normalized[i].direction = Math.round(Math.atan2(normalized[i + 1].long - normalized[i].long, normalized[i + 1].lat - normalized[i].lat) * 180 / Math.PI + 360) % 360;
    if (i > 1) {
      var last = normalized[i - 1].direction - normalized[i - 2].direction;
      var curr = normalized[i].direction - normalized[i - 1].direction;
      var lastDist = dist(normalized[i - 1], normalized[i - 2]);
      var currDist = dist(normalized[i], normalized[i - 1]);
      if (last * curr < -20) {
        console.error('unstable plane ' + f);
        return;
      }
      if ((currDist > lastDist * 2 || currDist < lastDist * 0.5) && Math.abs(currDist - lastDist) > interval * 1e-5) {
        console.error(currDist + ' ' + lastDist);
        console.error('unstable plane ' + f);
        return;
      }
    }
  }
  normalized[i].direction = normalized[i - 1].direction;
  result.push({ id: f.slice(0, f.indexOf('-')), data: normalized });
});

console.error(`${result.length} planes normalized.`);

// convert data back to original format
var temp = {};
result.forEach(d => {
  d.data.forEach(p => {
    temp[p.time] = temp[p.time] || {
      time: p.time,
      acList: []
    };
    temp[p.time].acList.push({
      Icao: d.id,
      PosTime: p.time,
      Lat: p.lat,
      Long: p.long
    });
  });
});
var out = [];
for (var k in temp) out.push(temp[k]);
out.sort((x, y) => x.time - y.time);

console.log(JSON.stringify(out));
