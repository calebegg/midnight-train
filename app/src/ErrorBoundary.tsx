/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import React from 'react';

export class ErrorBoundary extends React.Component<
  {},
  {
    error: unknown;
  }
> {
  constructor(props: {}) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: unknown) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }
  render() {
    if (this.state.error) {
      const { error } = this.state;
      if (error instanceof Error) {
        return (
          <>
            <h1>Unexpected error</h1>
            <textarea value={error.stack}></textarea>
          </>
        );
      }
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
