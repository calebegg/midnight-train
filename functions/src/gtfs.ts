/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import admin from 'firebase-admin';
import request from 'request-promise-native';
import { config } from 'firebase-functions';
import { transit_realtime } from '../generated/nyct';

const { FeedMessage } = transit_realtime;

const API_KEY = config().api_keys.gtfs_realtime;
export const FEEDS = [
  { id: 'gtfs', services: '123456' },
  { id: 'gtfs-ace', services: 'ACE' },
  { id: 'gtfs-nqrw', services: 'NQRW' },
  { id: 'gtfs-bdfm', services: 'BDFM' },
  { id: 'gtfs-l', services: 'L' },
  { id: 'gtfs-g', services: 'G' },
  { id: 'gtfs-jz', services: 'JZ' },
  { id: 'gtfs-7', services: '7' },
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
        let value;
        try {
          const gtfs = await request({
            url: `https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2F${feedId}`,
            headers: { 'x-api-key': API_KEY },
            encoding: null,
          });
          value = FeedMessage.decode(gtfs);
        } catch (e) {
          console.warn('Fetch failed', e);
          try {
            const file = admin.storage().bucket().file(`feed_${feedId}`);
            console.warn(
              `Using cache updated ${(await file.getMetadata())[0].updated}`,
            );
            const gtfs = (await file.download())[0];
            value = FeedMessage.decode(gtfs);
          } catch (e) {
            // console.warn('Cache failed', e);
            return { status: 'rejected', reason: new Error(services) };
          }
        }
        return {
          status: 'fulfilled',
          value,
        };
      }),
    )
  )
    .map(result => {
      if (result.status === 'fulfilled') {
        return result.value!;
      } else {
        for (const failure of (result.reason as Error).message.split('')) {
          failures.push(failure);
        }
      }
    })
    .filter(v => !!v)
    .map(r => {
      return r!.entity.map(entity => ({
        timestamp: r!.header.timestamp,
        entity,
      }));
    })
    .reduce((acc, v) => [...acc, ...v], []);

  const tripDelays: { [tripId: string]: number } = {};
  for (const { timestamp, entity } of entities) {
    if (!entity.vehicle) continue;
    tripDelays[entity.vehicle.trip!.tripId!] =
      (timestamp as Long).toNumber() -
      (entity.vehicle.timestamp as Long).toNumber();
  }
  for (const { entity } of entities) {
    if (!entity.tripUpdate) continue;
    const service = entity.tripUpdate.trip.routeId!;
    const tripId = entity.tripUpdate.trip.tripId!;
    const updates = entity.tripUpdate.stopTimeUpdate!;
    feedCache[tripId] = {
      tripId,
      service,
      times: updates
        .filter(u => u.arrival)
        .map(
          u =>
            +u.arrival!.time! +
            (tripDelays[tripId] > 90 ? tripDelays[tripId] : 0),
        ),
      stops: updates.map(u => u.stopId!),
    };
  }
  updated = Date.now();
  return { data: feedCache, failures };
}
