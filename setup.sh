#!/bin/bash

# Copyright 2019 Google LLC
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file or at https://opensource.org/licenses/MIT.

set -e

npm i
cd functions/ && npm i && cd ..
cd app/ && npm i && cd ..

wget http://web.mta.info/developers/data/nyct/subway/google_transit.zip
unzip google_transit.zip -d google_transit
rm google_transit.zip

mkdir app/src/generated
node scripts/generate_data.js > app/src/generated/data.json

npx firebase functions:config:get > functions/.runtimeconfig.json