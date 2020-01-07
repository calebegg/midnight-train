/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { render } from 'react-dom';
import { App } from './App';
import { config } from '@fortawesome/fontawesome-svg-core';

config.autoAddCss = false;

navigator.serviceWorker.register('../service-worker.ts', { scope: '/' });

render(<App />, document.querySelector('main'));

if (module && module.hot) module.hot.accept();
