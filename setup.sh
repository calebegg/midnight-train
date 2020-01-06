#!/bin/bash

# Copyright 2019 Google LLC
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file or at https://opensource.org/licenses/MIT.

set -e

npm i

rm -rf data
mkdir -p data
wget -P data http://web.mta.info/developers/data/nyct/subway/google_transit.zip
wget -P data http://web.mta.info/developers/data/nyct/subway/StationEntrances.csv
wget -P data http://web.mta.info/developers/data/nyct/subway/Stations.csv
wget -P data http://web.mta.info/developers/data/nyct/subway/StationComplexes.csv
unzip data/google_transit.zip -d data/google_transit
mkdir -p app/src/generated
node scripts/generate_data.js > app/src/generated/data.json

npx firebase functions:config:get > functions/.runtimeconfig.json

mkdir -p functions/generated
wget -O functions/generated/nyct-subway.proto http://datamine.mta.info/sites/all/files/pdfs/nyct-subway.proto.txt
wget -P functions/generated https://developers.google.com/transit/gtfs-realtime/gtfs-realtime.proto
npx pbjs -t static-module -w commonjs -o functions/generated/nyct.js functions/generated/nyct-subway.proto
npx pbts -o functions/generated/nyct.d.ts functions/generated/nyct.js
cp -R functions/generated functions/dist/functions

echo "Done"