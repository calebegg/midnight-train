/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { https } from 'firebase-functions';
import { fetchGtfs } from './gtfs';

interface Arrival {
  service: string;
  tripId: string;
  time: number;
  direction: string;
}

export const arrivals = https.onRequest(async (req, res) => {
  const byStop = new Map<string, Arrival[]>();

  const { data, failures } = await fetchGtfs();

  for (const trip of Object.values(data)) {
    const { service, tripId } = trip;
    for (let i = 0; i < trip.stops.length; i++) {
      const stopIdAndDirection: string = trip.stops[i];
      const stopId = stopIdAndDirection.slice(0, stopIdAndDirection.length - 1);
      const direction = stopIdAndDirection.slice(-1);
      const time: number = trip.times[i];
      byStop.set(stopId, [
        ...(byStop.get(stopId) || []),
        { service, tripId, time, direction },
      ]);
    }
  }

  const byStopJson: { [stopId: string]: any } = {};
  for (const [stopId, arrivalData] of byStop.entries()) {
    const arrivalsJson: any = { stopId };
    for (const direction of ['N', 'S'] as const) {
      const services = new Set(
        arrivalData.filter(a => a.direction === direction).map(a => a.service),
      );

      arrivalsJson[direction] = {};
      for (const service of services) {
        let times = arrivalData
          .filter(a => a.direction === direction && a.service === service)
          .sort((a, b) => a.time - b.time);
        // Sometimes duplicate arrival times appear in the data.
        arrivalsJson[direction][service] = [
          ...new Set(times.map(({ time }) => time * 1000)),
        ].slice(0, 6);
      }
    }
    byStopJson[stopId] = arrivalsJson;
  }

  res.set('Cache-Control', 'public, max-age=60, s-maxage=60').json({
    data: byStopJson,
    errorMessage:
      failures.length > 0
        ? `Failed to load data for ${failures.join(', ')}`
        : '',
  });
});
