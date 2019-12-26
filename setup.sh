#!/bin/bash

# Copyright 2019 Google LLC
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file or at https://opensource.org/licenses/MIT.

set -e

npm i

mkdir -p data
wget -P data http://web.mta.info/developers/data/nyct/subway/google_transit.zip
wget -P data http://web.mta.info/developers/data/nyct/subway/StationEntrances.csv
wget -P data http://web.mta.info/developers/data/nyct/subway/Stations.csv
unzip data/google_transit.zip -d data/google_transit
mkdir -p app/src/generated
node scripts/generate_data.js > app/src/generated/data.json
rm -r data

npx firebase functions:config:get > functions/.runtimeconfig.json

echo "Done"