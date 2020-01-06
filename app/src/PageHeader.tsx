/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import React, { PropsWithChildren } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { RouteComponentProps, Link } from '@reach/router';
import { LoadingStatus } from './App';

export function PageHeader({
  children,
  onRefresh,
  loadingStatus,
  showRefresh = true,
  showBack = false,
}: PropsWithChildren<{
  onRefresh: () => void;
  loadingStatus: LoadingStatus;
  showRefresh?: boolean;
  showBack?: boolean;
}>) {
  return (
    <header className="row">
      {showBack ? (
        <Link to="/" className="plain" style={{ marginRight: 16 }}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
      ) : (
        ''
      )}
      {children}
      <span style={{ flex: 1 }}></span>
      {showRefresh ? (
        <button className="plain" onClick={onRefresh}>
          <FontAwesomeIcon
            spin={loadingStatus === LoadingStatus.LOADING}
            icon={faSync}
          />
        </button>
      ) : (
        ''
      )}
    </header>
  );
}

export function PageTitle({ title }: { title: string } & RouteComponentProps) {
  return <h1>{title}</h1>;
}
