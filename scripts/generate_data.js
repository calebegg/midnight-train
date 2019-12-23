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

const stops = parse(fs.readFileSync('./data/google_transit/stops.txt'), {
  columns: true,
});

const stations = parse(fs.readFileSync('./data/Stations.csv'), {
  columns: true,
});

const entrances = parse(fs.readFileSync('./data/StationEntrances.csv'), {
  columns: true,
});

function normalize(value) {
  return Number(value).toFixed(4);
}

entrancesByLatLon = {};
for (const e of entrances) {
  entrancesByLatLon[
    `${normalize(e.Station_Latitude)},${normalize(e.Station_Longitude)}`
  ] = e;
}

stationsByStopId = {};
for (const s of stations) {
  stationsByStopId[s['GTFS Stop ID']] = s;
}

const stopInfo = {};

for (const stop of stops) {
  if (stop.parent_station) continue;
  if (!boroughs[stop.stop_id]) throw new Error('missing borough');
  const entrance =
    entrancesByLatLon[
      `${normalize(stop.stop_lat)},${normalize(stop.stop_lon)}`
    ];
  const station = stationsByStopId[stop.stop_id];
  if (!station) {
    // Phantom stations: 140, H19, N12, S10, S12
    continue;
  }
  stopInfo[stop.stop_id] = {
    name: stop.stop_name,
    latitude: +stop.stop_lat,
    longitude: +stop.stop_lon,
    borough: station['Borough'],
    crossover: entrance ? entrance.Free_Crossover == 'TRUE' : false,
    ada: entrance ? entrance.ADA == 'TRUE' : false,
    headNorth: station['North Direction Label'] || 'Arrivals',
    headSouth: station['South Direction Label'] || 'Arrivals',
  };
}

console.log(JSON.stringify({ stopInfo }, null, 2));
