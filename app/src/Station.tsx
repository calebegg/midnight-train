/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import React, { memo, ReactNode, useContext, useEffect, useState } from 'react';
import { ArrivalsContext, FavoritesContext } from './context';
import generated from './generated/data.json';
import { TimesData } from './types';
import { faStar, faWalking } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from '@reach/router';

const { stopInfo } = generated;

export function Station({ id, walkTime }: { id: string; walkTime?: number }) {
  const { favorites, toggleFavorite } = useContext(FavoritesContext);

  const station = (stopInfo as any)[id];
  const arrivalsData = useContext(ArrivalsContext);

  const data = arrivalsData
    ? arrivalsData[id] || { N: [], S: [] }
    : { N: undefined, S: undefined };

  return (
    <section className={`station${walkTime ? ' with-walk-time' : ''}`}>
      <h2>
        <span className={'borough ' + station.borough}>{station.borough}</span>
        {station.name}
        {walkTime ? (
          <div className="walk-time">
            <FontAwesomeIcon icon={faWalking} />
            <div>{Math.round(walkTime / 60)}m</div>
          </div>
        ) : null}
        <label className="favorite-toggle">
          <input
            type="checkbox"
            checked={favorites.has(id)}
            onChange={e => {
              toggleFavorite(id, e.target.checked);
            }}
          />
          <FontAwesomeIcon icon={faStar} />
        </label>
      </h2>
      <div className="row">
        <div className="north">
          <h3>{id.startsWith('L') ? 'Manhattan' : 'North'}</h3>
          <TimeTable data={data.N} direction="N" stopId={id} />
        </div>
        <div className="south">
          <h3>{id.startsWith('L') ? 'Brooklyn' : 'South'}</h3>
          <TimeTable data={data.S} direction="S" stopId={id} />
        </div>
      </div>
    </section>
  );
}

const TimeTable = memo(
  ({
    data,
    direction,
    stopId,
  }: {
    data?: TimesData;
    direction: string;
    stopId: string;
  }) => {
    return (
      <ul className="time-table">
        {data ? (
          Object.entries(data).length > 0 ? (
            Object.entries(data).map(([service, times]) => (
              <ArrivalList
                key={service}
                service={service}
                times={times || []}
                direction={direction}
                stopId={stopId}
              />
            ))
          ) : (
            <li>No upcoming arrivals</li>
          )
        ) : (
          <li>Loading...</li>
        )}
      </ul>
    );
  },
);

function ArrivalList({
  service,
  times,
  direction,
  stopId,
}: {
  service: string;
  times: number[];
  direction: string;
  stopId: string;
}) {
  function getCurrentTimes() {
    return times.filter(t => t - Date.now() > -60_000).slice(0, 3);
  }

  const [currentTimes, setCurrentTimes] = useState(getCurrentTimes());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTimes(getCurrentTimes());
    }, 10_000);
    return () => {
      clearInterval(intervalId);
    };
  }, [times]);

  return (
    <li>
      <Link to={`/trip/${service}/${direction}/${stopId}`}>
        <Bullet id={service} />{' '}
        {currentTimes
          .map(t => <TimeLabel key={t} timestamp={t} />)
          .reduce(
            (acc, v) => {
              if (acc.length > 0) acc.push(', ');
              acc.push(v);
              return acc;
            },
            [] as ReactNode[],
          )}
      </Link>
    </li>
  );
}

function TimeLabel({ timestamp }: { timestamp: number }) {
  function timeLeft() {
    return new Date(timestamp).getTime() - Date.now();
  }
  function minutesLeft() {
    return Math.floor(timeLeft() / 60_000);
  }
  const [minutes, setMinutes] = useState(minutesLeft());

  useEffect(() => {
    const interval = timeLeft() % 60_000;
    const timeoutId = setTimeout(
      () => {
        setMinutes(minutes => Math.min(minutes - 1, minutesLeft()));
      },
      interval > 0 ? interval : 60_000 - interval,
    );
    return () => {
      clearTimeout(timeoutId);
    };
  }, [timestamp, minutes]);

  return <span>{minutes}m</span>;
}

export function Bullet({ id }: { id: string }) {
  return (
    <span className={'bullet s' + id}>
      <span>{id.endsWith('X') ? id.charAt(0) : id}</span>
    </span>
  );
}
