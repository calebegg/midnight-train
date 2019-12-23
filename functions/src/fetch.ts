/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { transit_realtime } from 'gtfs-realtime-bindings';
import { pubsub, config } from 'firebase-functions';
import admin from 'firebase-admin';
import request from 'request-promise-native';
import { FEEDS } from './gtfs';

const { FeedMessage } = transit_realtime;

const API_KEY = config().api_keys.gtfs_realtime;

export const fetch = pubsub.schedule('every 2 minutes').onRun(async () => {
  await Promise.all(
    FEEDS.map(async ({ id: feedId }) => {
      try {
        let data = await request({
          url: `http://datamine.mta.info/mta_esi.php?key=${API_KEY}&feed_id=${feedId}`,
          encoding: null,
        });
        // Make sure it parses before continuing
        FeedMessage.decode(data);
        admin
          .storage()
          .bucket()
          .file(`feed_${feedId}`)
          .save(data);
      } catch (e) {
        console.warn('Request failed: ', e);
      }
    }),
  );
});
