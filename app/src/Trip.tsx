/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { RouteComponentProps } from '@reach/router';
import React, { useState, useEffect } from 'react';
import generated from './generated/data.json';
import { PageHeader, PageTitle } from './PageHeader';
import { LoadingStatus } from './App';
import { Station } from '../../common/types.js';

const { stationInfo } = generated;

const platformInfo: { [id: string]: Station['platforms'][0] } = {};
for (const platform of Object.values(stationInfo).flatMap(s => s.platforms)) {
  platformInfo[platform.id] = platform;
}

interface TripDataResponse {
  service: string;
  stops: Array<{ time: number; stopId: string }>;
}

declare global {
  namespace Intl {
    interface DateTimeFormatOptions {
      timeStyle?: 'short' | 'medium' | 'long' | 'full';
    }
  }
}

export function Trip({
  service,
  stopId,
  direction,
}: RouteComponentProps & {
  service: string;
  stopId: string;
  direction: string;
}) {
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>(
    LoadingStatus.LOADING,
  );

  const [data, setData] = useState<TripDataResponse[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      if (loadingStatus !== LoadingStatus.LOADING) return;
      try {
        const response: TripDataResponse[] = await (
          await fetch(`/_/trip/${service}/${direction}`, {
            signal: abort.signal,
          })
        ).json();
        setData(response);
        setIndex(index => {
          if (index !== -1) return index;
          const firstMatchIndex = response.findIndex(t =>
            t.stops.some(s => s.stopId === stopId),
          );
          if (firstMatchIndex !== -1) {
            return firstMatchIndex;
          } else {
            return 0;
          }
        });
      } catch (e) {
        if (e.name === 'AbortError') return;
        setErrorMessage('Failed to load trip data. Try again later.');
        return;
      } finally {
        setLoadingStatus(LoadingStatus.SUCCESS);
      }
    })();
    return () => {
      abort.abort();
    };
  }, [direction, loadingStatus, service, stopId]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingStatus(LoadingStatus.LOADING);
    }, 60_000);
    return () => {
      clearInterval(intervalId);
    };
  });

  return (
    <>
      {errorMessage && (
        <p role="alert" className="error">
          {errorMessage}
        </p>
      )}

      <PageHeader
        onRefresh={() => {
          setLoadingStatus(LoadingStatus.LOADING);
        }}
        loadingStatus={loadingStatus}
        showBack={true}
      >
        <PageTitle title="Trip"></PageTitle>
      </PageHeader>
      <button disabled={index === 0} onClick={() => setIndex(index - 1)}>
        earlier
      </button>
      <button
        disabled={!data || index === data.length - 1}
        onClick={() => setIndex(index + 1)}
      >
        later
      </button>
      <ul className={`trip s${service}`}>
        {data && index >= 0 ? (
          data[index].stops
            .filter(s => s.stopId in platformInfo)
            .map(s => (
              <li
                key={s.stopId}
                className={s.stopId === stopId ? 'selected' : ''}
              >
                <time>
                  {new Date(s.time).toLocaleTimeString(undefined, {
                    timeStyle: 'short',
                  })}
                </time>
                <span className="connector"></span>
                <span>
                  {platformInfo[s.stopId as keyof typeof platformInfo].name}
                </span>
              </li>
            ))
        ) : (
          <p>Loading data</p>
        )}
      </ul>
    </>
  );
}
