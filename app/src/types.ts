/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

export interface ArrivalsResponse {
  [stationId: string]: ArrivalsData;
}

export interface ArrivalsData {
  N?: TimesData;
  S?: TimesData;
  stopId: string;
}

export interface TimesData {
  [line: string]: number[] | undefined;
}
