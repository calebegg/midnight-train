/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { RouteComponentProps, Link } from '@reach/router';
import React, { useContext } from 'react';
import { FavoritesContext } from './context';
import { ErrorBoundary } from './ErrorBoundary';
import { byDistance } from './Nearby';
import { Station } from './Station';

export function Favorites({
  position,
}: { position: Position | null } & RouteComponentProps) {
  const { favorites } = useContext(FavoritesContext);

  return (
    <ErrorBoundary>
      <h1>Favorites</h1>
      {favorites.size === 0 ? (
        <p>
          You don't have any favorites yet.{' '}
          <Link to="/search">Search to find stations to add</Link>.
        </p>
      ) : (
        ''
      )}
      {[...favorites].sort(byDistance(position)).map(id => (
        <Station key={id} id={id} />
      ))}
    </ErrorBoundary>
  );
}
