/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { RouteComponentProps, Link } from '@reach/router';
import React, { useState, useEffect } from 'react';
import generated from './generated/data.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const { stopInfo } = generated;

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
  const [data, setData] = useState<TripDataResponse[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [index, setIndex] = useState(-1);

  async function loadTripData() {
    try {
      const response: TripDataResponse[] = await (await fetch(
        `/_/trip/${service}/${direction}`,
      )).json();
      setData(response);
      if (index === -1) {
        const firstMatchIndex = response.findIndex(t =>
          t.stops.some(s => s.stopId === stopId),
        );
        if (firstMatchIndex !== -1) {
          setIndex(firstMatchIndex);
        } else {
          setIndex(0);
        }
      }
    } catch (e) {
      setErrorMessage('Failed to load trip data. Try again later.');
      return;
    }
  }

  useEffect(() => {
    loadTripData();
    const intervalId = setInterval(loadTripData, 60_000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      {errorMessage && (
        <p role="alert" className="error">
          {errorMessage}
        </p>
      )}

      <h1>
        <Link to="/" style={{ marginRight: 16 }}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
        Trip
      </h1>
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
          data[index].stops.map(s => (
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
              <span>{stopInfo[s.stopId as keyof typeof stopInfo].name}</span>
            </li>
          ))
        ) : (
          <p>Loading data</p>
        )}
      </ul>
    </>
  );
}
