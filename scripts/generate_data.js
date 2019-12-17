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

stopInfo = {};

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

console.log(JSON.stringify({ stopInfo }, null, 2));
