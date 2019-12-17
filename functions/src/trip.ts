/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { fetchGtfs } from './gtfs';
import { https } from 'firebase-functions';

export const trip = https.onRequest(async (req, res) => {
  const [service, direction] = req.path.substring('/_/trip/'.length).split('/');
  const { data } = await fetchGtfs();
  const response: Array<{
    tripId: string;
    stops: Array<{ time: number; stopId: string }>;
  }> = Object.entries(data)
    .filter(
      ([tripId, tripData]) =>
        tripData.service === service &&
        tripId.match(new RegExp('\\.\\.' + direction)),
    )
    .map(([tripId, tripData]) => ({
      tripId,
      stops: tripData.stops.map((s, i) => ({
        time: tripData.times[i] * 1000,
        stopId: s.slice(0, -1),
      })),
    }));

  return res.json(response);
});
