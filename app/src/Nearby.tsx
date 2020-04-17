/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { RouteComponentProps } from '@reach/router';
import React, { useMemo, useState, useLayoutEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import generated from './generated/data.json';
import { Station } from './Station';

const { stationInfo } = generated;

const walkTimesCache = new Map<string, Map<string, number>>();

export function Nearby({
  position,
}: { position: Position | number | null } & RouteComponentProps) {
  const nearestStations = useMemo(() => {
    if (!position || typeof position === 'number') return [];
    return Object.keys(stationInfo).sort(byDistance(position)).slice(0, 5);
  }, [position]);

  const [walkTimes, setWalkTimes] = useState<Map<string, number>>(new Map());

  useLayoutEffect(() => {
    (async () => {
      if (!position || typeof position === 'number') return;
      if (nearestStations.length === 0) return;

      const originCoords = getCoordKey(position);

      const map =
        walkTimesCache.get(originCoords) ??
        new Map(
          ((await (
            await fetch(
              '/_/walktimes?' +
                new URLSearchParams([
                  ['origin', originCoords],
                  ...nearestStations.map(id => {
                    const station = stationInfo[id as keyof typeof stationInfo];
                    return [
                      'destination[]',
                      [
                        station.platforms[0].latitude,
                        station.platforms[0].longitude,
                      ].join(','),
                    ];
                  }),
                ]),
            )
          ).json()) as number[]).map((t, i) => [nearestStations[i], t]),
        );

      walkTimesCache.set(originCoords, map);
      setWalkTimes(map);
    })();
  }, [nearestStations, position]);

  return (
    <ErrorBoundary>
      {!position ? <p>Locating you</p> : ''}
      {typeof position === 'number' ? (
        <p>
          This app doesn't have permission to view your location. To view nearby
          stations, enable location access in your browser settings.
        </p>
      ) : (
        ''
      )}
      {nearestStations.map(id => (
        <Station key={id} id={id} walkTime={walkTimes.get(id)} />
      ))}
    </ErrorBoundary>
  );
}

let distanceCache: Map<string, number>;
let distanceCacheFor: Position;

export function byDistance(position: Position) {
  if (
    !distanceCacheFor ||
    position.coords.latitude !== distanceCacheFor.coords.latitude ||
    position.coords.longitude !== distanceCacheFor.coords.longitude
  ) {
    distanceCache = new Map();
    distanceCacheFor = position;
    for (const [stopId, stop] of Object.entries(stationInfo)) {
      distanceCache.set(
        stopId,
        Math.min(
          ...stop.platforms.map(
            p =>
              (p.latitude - position.coords.latitude) ** 2 +
              (p.longitude - position.coords.longitude) ** 2,
          ),
        ),
      );
    }
  }
  return (a: string, b: string) => {
    if (!distanceCache) return 0;
    return distanceCache.get(a)! - distanceCache.get(b)!;
  };
}

function getCoordKey(position: Position | null) {
  if (!position) return '';
  return [
    round(position.coords.latitude),
    round(position.coords.longitude),
  ].join(',');
}

function round(coord: number) {
  return (Math.round(coord / 0.0005) * 0.0005).toFixed(4);
}
