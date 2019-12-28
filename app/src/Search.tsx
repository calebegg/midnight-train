/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { RouteComponentProps } from '@reach/router';
import React, { useMemo, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import generated from './generated/data.json';
import { Station } from './Station';
import { StationData } from '../../common/types';

const { stationInfo } = generated;

let sessionQuery = '';

export function Search({}: RouteComponentProps) {
  const [query, setQuery] = useState(sessionQuery || '');

  const results = useMemo(() => {
    if (query === '') return [];
    let q = query.toLocaleLowerCase();
    q = q.replace(/\d([a-z]+)/, s => s.charAt(0));
    return Object.entries(stationInfo)
      .filter(([, station]) => station.name.toLocaleLowerCase().includes(q))
      .sort(([, a], [, b]) => {
        const aName = a.name.toLocaleLowerCase();
        const bName = b.name.toLocaleLowerCase();
        for (const metric of [
          (name: string) => name.startsWith(q),
          (name: string) => name.includes(' ' + q),
        ]) {
          if (metric(aName) && !metric(bName)) {
            return -1;
          } else if (!metric(aName) && metric(bName)) {
            return 1;
          }
        }
        return (
          b.platforms.flatMap(p => p.routes).length -
            a.platforms.flatMap(p => p.routes).length ||
          a.name.localeCompare(b.name)
        );
      })
      .map(([id]) => id)
      .slice(0, 10);
  }, [query]);

  return (
    <ErrorBoundary>
      <input
        autoFocus={true}
        className="search"
        value={query}
        onChange={({ target: { value } }) => {
          sessionQuery = value;
          setQuery(value);
        }}
      />
      {results.map(id => (
        <Station key={id} id={id} />
      ))}
    </ErrorBoundary>
  );
}
