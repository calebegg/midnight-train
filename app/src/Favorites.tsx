/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { Link, RouteComponentProps } from '@reach/router';
import React, { useContext, useMemo } from 'react';
import { FavoritesContext } from './context';
import { ErrorBoundary } from './ErrorBoundary';
import { byDistance } from './Nearby';
import { Station } from './Station';

export function Favorites({
  position,
}: { position: Position | number | null } & RouteComponentProps) {
  const { favorites } = useContext(FavoritesContext);

  const sortedFavorites = useMemo(() => {
    if (!position || typeof position === 'number') {
      return [...favorites];
    }
    return [...favorites].sort(byDistance(position)).slice(0, 5);
  }, [position, favorites]);

  return (
    <ErrorBoundary>
      {favorites.size === 0 ? (
        <p>
          You don't have any favorites yet.{' '}
          <Link to="/search">Search to find stations to add</Link>.
        </p>
      ) : (
        ''
      )}
      {sortedFavorites.map(id => (
        <Station key={id} id={id} />
      ))}
    </ErrorBoundary>
  );
}
