/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { createClient } from '@google/maps';
import { https, config } from 'firebase-functions';

const client = createClient({
  key: config().api_keys.google_maps,
  Promise,
});

const ONE_YEAR = 60 * 60 * 24 * 365;

// eslint-disable-next-line @typescript-eslint/no-misused-promises
export const walktimes = https.onRequest(async (req, res) => {
  const { json } = await client
    .distanceMatrix({
      mode: 'walking',
      origins: [req.query['origin'] as string],
      destinations: req.query['destination'] as string[],
    })
    .asPromise();
  res
    .set('Cache-Control', `public, max-age=${ONE_YEAR}, s-maxage=${ONE_YEAR}`)
    .json((json.rows[0].elements as any[]).map(c => c.duration.value));
});
