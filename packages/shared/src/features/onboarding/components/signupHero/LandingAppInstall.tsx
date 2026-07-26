import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import LogoIcon from '../../../../svg/LogoIcon';

// =============================================================
// App install prompt — a scannable card floated over the hero
// artwork on the split layouts.
//
// The QR encodes https://r.daily.dev/get — daily.dev's own smart
// link, which redirects on User-Agent, so the one code sends
// iPhones to the App Store and Android to Google Play.
//
// Because that URL is fixed, the code is a static asset rather than
// a runtime dependency: the module matrix was generated once at
// error-correction level H (30% recovery, which is what lets the
// logo sit on top without breaking the scan) and flattened into a
// single path of horizontal runs. The viewBox carries the 4-module
// quiet zone the spec requires. Regenerate if the URL changes.
// =============================================================

const QR_MODULES = 29;
// The spec asks for 4 modules of quiet zone. We bake in 2 and let the white
// box's own padding make up the rest, which buys the code ~12% more area
// inside the same box. Level H's 30% recovery covers the shortfall.
const QR_QUIET_ZONE = 2;
const QR_SIZE = QR_MODULES + QR_QUIET_ZONE * 2;
const QR_PATH =
  'M0 0h7v1h-7zM9 0h1v1h-1zM13 0h1v1h-1zM16 0h1v1h-1zM18 0h1v1h-1zM22 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM12 1h2v1h-2zM15 1h1v1h-1zM17 1h2v1h-2zM20 1h1v1h-1zM22 1h1v1h-1zM28 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM9 2h2v1h-2zM13 2h1v1h-1zM16 2h1v1h-1zM19 2h2v1h-2zM22 2h1v1h-1zM24 2h3v1h-3zM28 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM12 3h3v1h-3zM17 3h1v1h-1zM22 3h1v1h-1zM24 3h3v1h-3zM28 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM8 4h1v1h-1zM10 4h1v1h-1zM12 4h1v1h-1zM14 4h2v1h-2zM17 4h1v1h-1zM19 4h1v1h-1zM22 4h1v1h-1zM24 4h3v1h-3zM28 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM10 5h2v1h-2zM13 5h1v1h-1zM15 5h1v1h-1zM19 5h1v1h-1zM22 5h1v1h-1zM28 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h1v1h-1zM20 6h1v1h-1zM22 6h7v1h-7zM8 7h2v1h-2zM11 7h1v1h-1zM13 7h1v1h-1zM15 7h1v1h-1zM17 7h1v1h-1zM19 7h1v1h-1zM2 8h2v1h-2zM6 8h3v1h-3zM20 8h3v1h-3zM24 8h1v1h-1zM0 9h2v1h-2zM7 9h5v1h-5zM17 9h4v1h-4zM22 9h5v1h-5zM28 9h1v1h-1zM1 10h4v1h-4zM6 10h1v1h-1zM13 10h1v1h-1zM15 10h4v1h-4zM22 10h1v1h-1zM26 10h2v1h-2zM0 11h3v1h-3zM9 11h1v1h-1zM11 11h2v1h-2zM15 11h6v1h-6zM23 11h1v1h-1zM28 11h1v1h-1zM0 12h1v1h-1zM3 12h2v1h-2zM6 12h1v1h-1zM9 12h3v1h-3zM13 12h2v1h-2zM16 12h2v1h-2zM21 12h1v1h-1zM23 12h1v1h-1zM25 12h4v1h-4zM0 13h2v1h-2zM5 13h1v1h-1zM8 13h7v1h-7zM17 13h4v1h-4zM22 13h2v1h-2zM25 13h2v1h-2zM28 13h1v1h-1zM1 14h2v1h-2zM4 14h1v1h-1zM6 14h4v1h-4zM11 14h1v1h-1zM13 14h2v1h-2zM16 14h1v1h-1zM18 14h2v1h-2zM21 14h5v1h-5zM27 14h2v1h-2zM1 15h1v1h-1zM4 15h2v1h-2zM7 15h1v1h-1zM10 15h6v1h-6zM19 15h1v1h-1zM21 15h2v1h-2zM24 15h2v1h-2zM0 16h2v1h-2zM4 16h1v1h-1zM6 16h6v1h-6zM13 16h1v1h-1zM16 16h2v1h-2zM20 16h1v1h-1zM23 16h3v1h-3zM28 16h1v1h-1zM1 17h1v1h-1zM3 17h2v1h-2zM9 17h4v1h-4zM16 17h1v1h-1zM18 17h1v1h-1zM20 17h1v1h-1zM23 17h1v1h-1zM25 17h2v1h-2zM0 18h1v1h-1zM2 18h6v1h-6zM10 18h1v1h-1zM12 18h2v1h-2zM15 18h1v1h-1zM18 18h1v1h-1zM20 18h1v1h-1zM22 18h1v1h-1zM24 18h2v1h-2zM4 19h2v1h-2zM7 19h2v1h-2zM15 19h2v1h-2zM19 19h1v1h-1zM21 19h2v1h-2zM26 19h3v1h-3zM1 20h3v1h-3zM5 20h2v1h-2zM13 20h1v1h-1zM17 20h1v1h-1zM19 20h10v1h-10zM8 21h1v1h-1zM10 21h1v1h-1zM15 21h1v1h-1zM17 21h4v1h-4zM24 21h2v1h-2zM27 21h2v1h-2zM0 22h7v1h-7zM8 22h1v1h-1zM10 22h3v1h-3zM16 22h2v1h-2zM19 22h2v1h-2zM22 22h1v1h-1zM24 22h1v1h-1zM26 22h2v1h-2zM0 23h1v1h-1zM6 23h1v1h-1zM9 23h1v1h-1zM11 23h1v1h-1zM15 23h4v1h-4zM20 23h1v1h-1zM24 23h1v1h-1zM27 23h2v1h-2zM0 24h1v1h-1zM2 24h3v1h-3zM6 24h1v1h-1zM9 24h5v1h-5zM17 24h2v1h-2zM20 24h8v1h-8zM0 25h1v1h-1zM2 25h3v1h-3zM6 25h1v1h-1zM8 25h2v1h-2zM11 25h2v1h-2zM16 25h4v1h-4zM24 25h2v1h-2zM27 25h1v1h-1zM0 26h1v1h-1zM2 26h3v1h-3zM6 26h1v1h-1zM8 26h1v1h-1zM10 26h2v1h-2zM13 26h1v1h-1zM20 26h1v1h-1zM23 26h1v1h-1zM25 26h2v1h-2zM28 26h1v1h-1zM0 27h1v1h-1zM6 27h1v1h-1zM10 27h3v1h-3zM14 27h2v1h-2zM17 27h1v1h-1zM20 27h1v1h-1zM22 27h1v1h-1zM24 27h2v1h-2zM27 27h1v1h-1zM0 28h7v1h-7zM9 28h1v1h-1zM12 28h2v1h-2zM16 28h2v1h-2zM19 28h5v1h-5zM27 28h1v1h-1z';

export const LandingAppInstall = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'onb-glass-card flex w-fit flex-col items-center gap-2.5 rounded-24 p-3',
      className,
    )}
    data-testid="landing-app-install"
  >
    {/* The card always sits on the dark artwork, so its label is fixed light
        rather than theme-driven — text-primary would go dark in light mode and
        disappear into the illustration. */}
    <p className="text-center font-bold text-raw-salt-10 typo-footnote">
      Scan to get the app
    </p>
    <div className="relative rounded-12 bg-white p-1.5">
      <svg
        aria-hidden
        className="block size-36"
        shapeRendering="crispEdges"
        viewBox={`${-QR_QUIET_ZONE} ${-QR_QUIET_ZONE} ${QR_SIZE} ${QR_SIZE}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path className="fill-raw-pepper-90" d={QR_PATH} />
      </svg>
      {/* raw tokens, not theme ones: this badge sits on the QR's own white
          field, so it must stay dark-on-white in both themes */}
      <span className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-8 bg-raw-pepper-90 ring-2 ring-white">
        <LogoIcon className={{ container: 'h-3.5', group: 'fill-white' }} />
      </span>
    </div>
  </div>
);
