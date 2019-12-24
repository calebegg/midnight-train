/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file or at https://opensource.org/licenses/MIT.
 */

const puppeteer = require('puppeteer');

// https://iosref.com/res/
const SIZES = [
  '414x896@3x',
  '375x812@3x',
  '414x896@2x',
  '414x736@3x',
  '375x667@2x',
  '320x568@2x',
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  for (const size of SIZES) {
    const [horiz, vert, scale] = size.split(/[@x]/).map(v => +v);
    for (const orientation of ['portrait']) {
      const [width, height] =
        orientation === 'portrait' ? [horiz, vert] : [vert, horiz];
      await page.setViewport({
        width,
        height,
        deviceScaleFactor: scale,
      });
      await page.goto('http://localhost:5000/splash');
      const filename = `splash-${width * scale}x${height * scale}.png`;
      await page.screenshot({
        path: `assets/${filename}`,
      });
      // eslint-disable-next-line no-console
      console.log(`<link rel="apple-touch-startup-image"
      media="screen and (device-width: ${horiz}px) and (device-height: ${vert}px) and (-webkit-device-pixel-ratio: ${scale}) and (orientation: ${orientation})"
      href="${filename}"
    />`);
    }
  }
  await browser.close();
})();
