/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { RouteComponentProps, Router } from '@reach/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// @ts-ignore
import icon from '../icon_512.png';
import { ArrivalsContext, FavoritesContext } from './context';
import { ErrorBoundary } from './ErrorBoundary';
import { Favorites } from './Favorites';
import { Nav } from './Nav';
import { Nearby } from './Nearby';
import { Search } from './Search';
import { ArrivalsResponse } from './types';
import { Trip } from './Trip';

export function App() {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(l => {
      setPosition(l);
    });
  }, []);

  const [data, setData] = useState<ArrivalsResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadArrivalsData() {
    try {
      const response = await (await fetch('/_/arrivals')).json();
      setData(response.data);
      if (response.errorMessage) setErrorMessage(response.errorMessage);
    } catch (e) {
      setErrorMessage('Failed to load arrival data. Try again later.');
      return;
    }
  }

  useEffect(() => {
    loadArrivalsData();
    const intervalId = setInterval(loadArrivalsData, 60_000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('favorites') || '[]')),
  );

  const toggleFavorite = useCallback(
    (stopId: string, value: boolean) => {
      setFavorites(favorites => {
        favorites = new Set(favorites);
        if (value) favorites.add(stopId);
        else favorites.delete(stopId);
        return favorites;
      });
    },
    [setFavorites],
  );

  const favoritesContextValue = useMemo(() => ({ favorites, toggleFavorite }), [
    favorites,
    toggleFavorite,
  ]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  return (
    <ErrorBoundary>
      <Nav />

      {errorMessage && (
        <p role="alert" className="error">
          {errorMessage}
        </p>
      )}

      <ErrorBoundary>
        <ArrivalsContext.Provider value={data}>
          <FavoritesContext.Provider value={favoritesContextValue}>
            <Router>
              <Nearby path="/" position={position} />
              <Favorites path="/favorites" position={position} />
              <Search path="/search" />
              <Trip
                path="/trip/:service/:direction/:stopId"
                service="set-by-reach"
                stopId="set-by-reach"
                direction="set-by-reach"
              />
              <Splash path="/splash" />
            </Router>
          </FavoritesContext.Provider>
        </ArrivalsContext.Provider>
      </ErrorBoundary>
    </ErrorBoundary>
  );
}

function Splash({}: RouteComponentProps) {
  return (
    <div className="splash">
      <img src={icon} />
      <h1>Midnight Train</h1>
    </div>
  );
}
