/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { RouteComponentProps, Router, globalHistory } from '@reach/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// @ts-ignore
import icon from '../icon_512.png';
import { ArrivalsContext, FavoritesContext } from './context';
import { ErrorBoundary } from './ErrorBoundary';
import { Favorites } from './Favorites';
import { Nav } from './Nav';
import { Nearby } from './Nearby';
import { Search } from './Search';
import { ArrivalsResponse } from '../../common/types';
import { Trip } from './Trip';
import { PageHeader, PageTitle } from './PageHeader';

export enum LoadingStatus {
  LOADING,
  SUCCESS,
}

export function App() {
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(
    LoadingStatus.LOADING,
  );

  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    if (loadingStatus !== LoadingStatus.LOADING) return;
    navigator.geolocation.getCurrentPosition(l => {
      setPosition(l);
    });
  }, [loadingStatus]);

  const [data, setData] = useState<ArrivalsResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (loadingStatus !== LoadingStatus.LOADING) return;
    const abort = new AbortController();
    (async () => {
      try {
        const response = await (
          await fetch('/_/arrivals', { signal: abort.signal })
        ).json();
        setData(response.data);
        if (response.errorMessage) setErrorMessage(response.errorMessage);
      } catch (e) {
        setErrorMessage('Failed to load arrival data. Try again later.');
        return;
      } finally {
        setLoadingStatus(LoadingStatus.SUCCESS);
      }
    })();
    return () => {
      abort.abort();
    };
  }, [loadingStatus]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingStatus(LoadingStatus.LOADING);
    }, 60_000);
    return () => {
      clearInterval(intervalId);
    };
  });

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

  useEffect(() => {
    return globalHistory.listen(({ action }) => {
      if (action === 'PUSH' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  });

  return (
    <ErrorBoundary>
      <Nav />

      {errorMessage && (
        <p role="alert" className="error">
          {errorMessage}
        </p>
      )}

      {!location.pathname.startsWith('/trip/') ? (
        <PageHeader
          loadingStatus={loadingStatus}
          onRefresh={() => {
            setLoadingStatus(LoadingStatus.LOADING);
          }}
        >
          <Router primary={false}>
            <PageTitle title="Nearby" path="/"></PageTitle>
            <PageTitle title="Favorites" path="/favorites"></PageTitle>
            <PageTitle title="Search" path="/search"></PageTitle>
          </Router>
        </PageHeader>
      ) : (
        ''
      )}
      <ErrorBoundary>
        <ArrivalsContext.Provider value={data}>
          <FavoritesContext.Provider value={favoritesContextValue}>
            <Router primary={false}>
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
