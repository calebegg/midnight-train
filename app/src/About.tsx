/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { RouteComponentProps } from '@reach/router';
import React from 'react';

export function About({}: RouteComponentProps) {
  return (
    <>
      <p>
        Midnight Train is an experiment in showing the NYC subway's real time
        arrival data in a super fast, dense, commuter-centric format. There are
        lots of apps and services for help with navigation and wayfinding.
        Midnight Train is for a day to day rider who knows where they're going
        and wants one-tap answers to questions like:
        <ul>
          <li>
            Is the L train running normally? (real time arrival data typically
            offers a quick answer to that question without having to read and
            understand complex service announcements).
          </li>
          <li>Should I walk three minutes farther to take a G?</li>
          <li>Should I take the J that's coming now or wait for the next M?</li>
          <li>
            Do I need to message my boss to tell them I'll be a few minutes
            late?
          </li>
        </ul>
        It's a work in progress for now, but the basic functionality I want from
        it is there.
      </p>
      <p>
        All data comes from the MTA's{' '}
        <a href="https://new.mta.info/developers">static and real time APIs</a>.
        Thanks to them for making these APIs widely available to hobbyists like
        me, and for providing excellent documentation.
      </p>
      <p>
        Route symbols ™ Metropolitan Transit Authority. Used with permission.
      </p>
    </>
  );
}
