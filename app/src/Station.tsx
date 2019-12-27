/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { faAccessibleIcon } from '@fortawesome/free-brands-svg-icons';
import { faStar, faWalking } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from '@reach/router';
import React, { memo, ReactNode, useContext, useEffect, useState } from 'react';
import { Station, TimesData } from '../../common/types';
import { ArrivalsContext, FavoritesContext } from './context';
import generated from './generated/data.json';

const stopInfo: {
  [k: string]: Station;
} = generated.stationInfo;

const BOROUGH_NAMES = {
  'Q': 'Queens',
  'M': 'Manhattan',
  'Bx': 'Bronx',
  'Bk': 'Brooklyn',
  'SI': 'Staten Island',
};

export function Station({ id, walkTime }: { id: string; walkTime?: number }) {
  const { favorites, toggleFavorite } = useContext(FavoritesContext);

  const station = stopInfo[id];
  const arrivalsData = useContext(ArrivalsContext);

  return (
    <section className={`station${walkTime ? ' with-walk-time' : ''}`}>
      <h2>
        <span className="borough">
          {BOROUGH_NAMES[station.borough as keyof typeof BOROUGH_NAMES]}
          <span className="metadata">
            {station.ada ? <FontAwesomeIcon icon={faAccessibleIcon} /> : ''}
          </span>
        </span>
        {station.name}
        {walkTime ? (
          <a
            href={
              'https://www.google.com/maps/?q=' +
              `${station.platforms[0].latitude},${station.platforms[0].longitude}`
            }
            className="walk-time"
          >
            <FontAwesomeIcon icon={faWalking} />
            <div>{Math.round(walkTime / 60)}m</div>
          </a>
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
      {station.platforms.map(platform => (
        <div key={platform.id}>
          {station.platforms.length > 1 ? (
            <h3>
              {platform.routes.map(r => (
                <Bullet key={r} id={r} />
              ))}{' '}
              platform
            </h3>
          ) : (
            ''
          )}
          <div className="row">
            <div className="north">
              <h4>
                <span>{platform.headNorth || 'No service'}</span>
                {!station.crossover ? (
                  <svg
                    className="crossover-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 120 120"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="m45 15v90m30-90v90m-45-15l15 15 15-15m0-60l15-15 15 15m-60 0l60 60"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="12"
                    />
                  </svg>
                ) : (
                  ''
                )}
              </h4>
              <TimeTable
                data={arrivalsData?.[platform.id].N}
                direction="N"
                stopId={id}
              />
            </div>
            <div className="south">
              <h4>{platform.headSouth || 'No service'}</h4>
              <TimeTable
                data={arrivalsData?.[platform.id].S}
                direction="S"
                stopId={platform.id}
              />
            </div>
          </div>
        </div>
      ))}
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

function getCurrentTimes(times: number[]) {
  return times.filter(t => t - Date.now() > -60_000).slice(0, 3);
}

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
  const [currentTimes, setCurrentTimes] = useState(getCurrentTimes(times));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTimes(getCurrentTimes(times));
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
          .reduce((acc, v) => {
            if (acc.length > 0) acc.push(', ');
            acc.push(v);
            return acc;
          }, [] as ReactNode[])}
      </Link>
    </li>
  );
}

function timeLeft(timestamp: number) {
  return new Date(timestamp).getTime() - Date.now();
}
function minutesLeft(timestamp: number) {
  return Math.floor(timeLeft(timestamp) / 60_000);
}

function TimeLabel({ timestamp }: { timestamp: number }) {
  const [minutes, setMinutes] = useState(minutesLeft(timestamp));

  useEffect(() => {
    const interval = timeLeft(timestamp) % 60_000;
    const timeoutId = setTimeout(
      () => {
        setMinutes(minutes => Math.min(minutes - 1, minutesLeft(timestamp)));
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
