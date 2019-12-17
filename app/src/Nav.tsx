/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import {
  faMapMarkerAlt,
  faSearch,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, LinkGetProps } from '@reach/router';
import React from 'react';
export function Nav() {
  function markActive({ isCurrent }: LinkGetProps) {
    return { className: isCurrent ? 'active' : '' };
  }
  return (
    <nav>
      <ul>
        <li>
          <Link to="/" getProps={markActive}>
            <FontAwesomeIcon icon={faMapMarkerAlt} />
          </Link>
        </li>
        <li>
          <Link to="/favorites" getProps={markActive}>
            <FontAwesomeIcon icon={faStar} />
          </Link>
        </li>
        <li>
          <Link to="/search" getProps={markActive}>
            <FontAwesomeIcon icon={faSearch} />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
