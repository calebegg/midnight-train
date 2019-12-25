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

const { stopInfo } = generated;

let sessionQuery = '';

export function Search({}: RouteComponentProps) {
  const [query, setQuery] = useState(sessionQuery || '');

  const results = useMemo(() => {
    if (query === '') return [];
    return Object.entries(stopInfo)
      .filter(([, station]) =>
        station.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      )
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
