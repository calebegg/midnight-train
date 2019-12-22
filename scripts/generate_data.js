/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const boroughs = require('./boroughs.json');

const stops = parse(fs.readFileSync('./google_transit/stops.txt'), {
  columns: true,
});

const trips = parse(fs.readFileSync('./google_transit/trips.txt'), {
  columns: true,
});

const stopTimes = parse(fs.readFileSync('./google_transit/stop_times.txt'), {
  columns: true,
});

const stopInfo = {};

for (const stop of stops) {
  if (stop.parent_station) continue;
  if (!boroughs[stop.stop_id]) throw new Error('missing borough');
  stopInfo[stop.stop_id] = {
    name: stop.stop_name,
    latitude: +stop.stop_lat,
    longitude: +stop.stop_lon,
    borough: boroughs[stop.stop_id],
  };
}

// tripId => direction => string
const tripHeadsigns = {};
for (const t of trips) {
  tripHeadsigns[t.trip_id] = t.trip_headsign;
}

const tripStops = {};

for (const s of stopTimes) {
  if (!(s.trip_id in tripStops)) {
    tripStops[s.trip_id] = [];
  }
  tripStops[s.trip_id][+s.stop_sequence - 1] = {
    stopId: s.stop_id.slice(0, -1),
    direction: s.stop_id.slice(-1),
  };
}

const headsigns = {};
for (const [tripId, stops] of Object.entries(tripStops)) {
  for (const stop of stops) {
    if (!(stop.stopId in headsigns)) {
      headsigns[stop.stopId] = { N: '', S: '' };
    }
    headsigns[stop.stopId][stop.direction] = tripHeadsigns[tripId];
  }
}

for (const [tripId, stops] of Object.entries(tripStops)) {
  for (const [i, stop] of stops.entries()) {
    const borough = boroughs[stop.stopId];
    let overwritingBorough;
    for (let j = i; j >= 0; j--) {
      const otherBoroguh = boroughs[stops[j].stopId];
      if (!overwritingBorough && borough != otherBoroguh) {
        overwritingBorough = otherBoroguh;
      }
      if (overwritingBorough && overwritingBorough != otherBoroguh) {
        break;
      }
      if (overwritingBorough) {
        headsigns[stops[j].stopId][stops[j].direction] = borough;
      }
    }
    if (!headsigns[stop.stopId][stop.direction]) {
      headsigns[stop.stopId][stop.direction] = tripHeadsigns[tripId];
    }
  }
}

for (const [stopId, signs] of Object.entries(headsigns)) {
  stopInfo[stopId]['headNorth'] = signs['N'];
  stopInfo[stopId]['headSouth'] = signs['S'];
}

console.log(JSON.stringify({ stopInfo }, null, 2));
