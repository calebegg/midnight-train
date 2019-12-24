/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import React, { PropsWithChildren } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { RouteComponentProps } from '@reach/router';
import { LoadingStatus } from './App';

export function PageHeader({
  children,
  onRefresh,
  loadingStatus,
}: PropsWithChildren<{ onRefresh: () => void; loadingStatus: LoadingStatus }>) {
  return (
    <header className="row">
      {children}
      <span style={{ flex: 1 }}></span>
      <button className="plain" onClick={onRefresh}>
        <FontAwesomeIcon
          spin={loadingStatus === LoadingStatus.LOADING}
          icon={faSync}
        />
      </button>
    </header>
  );
}

export function PageTitle({ title }: { title: string } & RouteComponentProps) {
  return <h1>{title}</h1>;
}
