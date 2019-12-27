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

export interface Station {
  name: string;
  borough: string;
  crossover: boolean;
  ada: boolean;
  platforms: Array<{
    id: string;
    name: string;
    routes: string[];
    latitude: number;
    longitude: number;
    headNorth?: string;
    headSouth?: string;
  }>;
}
