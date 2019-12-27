/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

import { createContext } from 'react';
import { ArrivalsResponse } from '../../common/types';

export const FavoritesContext = createContext({
  favorites: new Set<string>(),
  toggleFavorite: (unusedStopId: string, unusedValue: boolean) => {},
});

export const ArrivalsContext = createContext<ArrivalsResponse | null>(null);
