/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const stops = parse(fs.readFileSync('./data/google_transit/stops.txt'), {
  columns: true,
});

const stations = parse(fs.readFileSync('./data/Stations.csv'), {
  columns: true,
});

const entrances = parse(fs.readFileSync('./data/StationEntrances.csv'), {
  columns: true,
});

const complexes = parse(fs.readFileSync('./data/StationComplexes.csv'), {
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

const complexNames = {};
for (const c of complexes) {
  complexNames[c['Complex ID']] = c['Complex Name'];
}

const stationInfo = {};

for (const stop of stops) {
  if (stop.parent_station) continue;
  const entrance =
    entrancesByLatLon[
      `${normalize(stop.stop_lat)},${normalize(stop.stop_lon)}`
    ];
  const station = stationsByStopId[stop.stop_id];
  if (!station) {
    // Phantom stations: 140, H19, N12, S10, S12
    continue;
  }
  const complexId = station['Complex ID'];
  if (!stationInfo[complexId]) {
    stationInfo[complexId] = {
      name: complexNames[complexId] || stop.stop_name,
      borough: station['Borough'],
      crossover: entrance ? entrance.Free_Crossover == 'TRUE' : false,
      ada: entrance ? entrance.ADA == 'TRUE' : false,
      platforms: [],
    };
  }
  stationInfo[complexId].platforms.push({
    id: stop.stop_id,
    name: stop.stop_name,
    routes: station['Daytime Routes'].split(/\s/g),
    latitude: +stop.stop_lat,
    longitude: +stop.stop_lon,
    headNorth: station['North Direction Label'] || '',
    headSouth: station['South Direction Label'] || '',
  });
}

// eslint-disable-next-line no-console
console.log(JSON.stringify({ stationInfo }, null, 2));
