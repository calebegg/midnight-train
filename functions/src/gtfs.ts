/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { transit_realtime } from 'gtfs-realtime-bindings';
import admin from 'firebase-admin';
import request from 'request-promise-native';
import { config } from 'firebase-functions';

const { FeedMessage } = transit_realtime;

const API_KEY = config().api_keys.gtfs_realtime;

export const FEEDS = [
  { id: '1', services: '123456S' },
  { id: '26', services: 'ACEHS' },
  { id: '16', services: 'NQRW' },
  { id: '21', services: 'BDFM' },
  { id: '2', services: 'L' },
  { id: '31', services: 'G' },
  { id: '36', services: 'JZ' },
  { id: '51', services: '7' },
];

let feedCache: {
  [tripId: string]: {
    tripId: string;
    service: string;
    times: number[];
    stops: string[];
  };
} = {};
let updated = 0;
let failures: string[] = [];

export async function fetchGtfs() {
  if (Date.now() - updated < 60 * 1000) {
    return { data: feedCache, failures };
  }

  feedCache = {};
  failures = [];

  const entities = (
    await Promise.all(
      FEEDS.map(async ({ id: feedId, services }) => {
        let gtfs;
        try {
          gtfs = await request({
            url: `http://datamine.mta.info/mta_esi.php?key=${API_KEY}&feed_id=${feedId}`,
            encoding: null,
          });
        } catch {
          try {
            const file = admin
              .storage()
              .bucket()
              .file(`feed_${feedId}`);
            console.warn(
              `Fetch failed, using cache updated ${
                (await file.getMetadata())[0].updated
              }`,
            );
            gtfs = (await file.download())[0];
          } catch (e) {
            console.warn('Cache failed', e);
            return { status: 'rejected', reason: new Error(services) };
          }
        }
        return {
          status: 'fulfilled',
          value: FeedMessage.decode(gtfs).entity,
        };
      }),
    )
  )
    .map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        for (const failure of (result.reason as Error).message.split('')) {
          failures.push(failure);
        }
      }
    })
    .filter(v => !!v)
    .reduce((acc, v) => [...acc, ...v], []);

  for (const entity of entities) {
    if (!entity.tripUpdate) continue;
    const service = entity.tripUpdate.trip.routeId;
    const tripId = entity.tripUpdate.trip.tripId;
    const updates: any[] = entity.tripUpdate.stopTimeUpdate;
    feedCache[tripId] = {
      tripId,
      service,
      times: updates.map((u: any) =>
        u.arrival ? +u.arrival.time : +u.departure.time,
      ),
      stops: updates.map(u => u.stopId),
    };
  }
  updated = Date.now();
  return { data: feedCache, failures };
}
