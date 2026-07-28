import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { DailyIcon } from '../../../components/icons';
import { appsUrl } from '../../../lib/constants';

// A desktop visitor can't install a phone app from the machine they're on, so
// the header entry point hands them a scannable code instead of a dead-end
// store link. Attribution rides along in the URL because the QR is the only
// hop we get - once the phone opens it, the desktop session is out of the loop.
export const getAppQrUrl = `${appsUrl}?utm_source=header_qr`;

// Pre-rendered matrix for `getAppQrUrl` (45x45 units = 37 modules plus the
// 4-module quiet zone). The target never changes at runtime, so we ship the
// matrix rather than pull a QR library into the header bundle for one code.
// Editing `getAppQrUrl` without regenerating this silently ships a code that
// still points at the old URL. Regenerate with:
//   npx qrcode -t svg -e H -- "<getAppQrUrl>"
//
// Error correction is level H (recovers ~30% of the matrix) specifically so the
// centre can be knocked out for the logo. Dropping back to level M would make
// the branded version unscannable.
const QR_MATRIX_PATH =
  'M4 4.5h7m2 0h2m1 0h2m3 0h2m1 0h2m1 0h1m1 0h1m2 0h1m1 0h7M4 5.5h1m5 0h1m3 0h1m1 0h3m3 0h2m1 0h5m2 0h1m1 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m2 0h4m1 0h2m1 0h1m1 0h1m3 0h1m1 0h3m2 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m8 0h1m6 0h1m1 0h3m3 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h1m1 0h1m5 0h2m1 0h7m1 0h1m2 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m2 0h4m1 0h3m3 0h4m2 0h1m3 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M12 11.5h1m4 0h3m1 0h1m4 0h1m1 0h1m2 0h2M6 12.5h2m2 0h3m3 0h5m1 0h3m2 0h1m2 0h2m1 0h2m1 0h1M5 13.5h2m1 0h2m2 0h4m1 0h1m1 0h3m1 0h2m3 0h5m2 0h1m2 0h2M5 14.5h2m1 0h1m1 0h1m2 0h2m1 0h3m2 0h1m2 0h3m1 0h2m3 0h1m1 0h3m1 0h1M5 15.5h2m1 0h2m1 0h1m2 0h1m2 0h3m2 0h1m1 0h1m1 0h2m1 0h4m2 0h1m1 0h4M4 16.5h1m2 0h2m1 0h1m4 0h3m1 0h1m1 0h1m5 0h5m1 0h2m1 0h3m1 0h1M4 17.5h1m4 0h1m3 0h2m1 0h5m3 0h2m1 0h2m1 0h3m1 0h3m1 0h3M5 18.5h1m2 0h1m1 0h3m1 0h2m1 0h3m2 0h3m1 0h1m1 0h2m3 0h1m1 0h1m2 0h2M4 19.5h6m2 0h4m1 0h1m2 0h2m2 0h1m2 0h2m1 0h1m3 0h2m3 0h2M5 20.5h1m4 0h3m1 0h3m5 0h1m1 0h2m1 0h3m7 0h4M5 21.5h2m2 0h1m3 0h1m1 0h3m1 0h1m2 0h11m1 0h1m2 0h1m2 0h1M4 22.5h1m4 0h2m3 0h2m1 0h2m4 0h1m2 0h1m1 0h1m1 0h2m1 0h1m2 0h2m1 0h2M6 23.5h1m1 0h2m3 0h2m1 0h2m1 0h1m2 0h2m3 0h2m2 0h2m2 0h1m1 0h1m2 0h1M4 24.5h1m2 0h1m2 0h1m1 0h3m1 0h1m2 0h1m1 0h1m8 0h1m1 0h2m2 0h2m2 0h1M4 25.5h1m1 0h4m3 0h4m2 0h4m1 0h2m1 0h1m2 0h1m2 0h3m2 0h2M8 26.5h3m3 0h1m6 0h1m1 0h1m2 0h2m2 0h1m5 0h4M5 27.5h1m2 0h2m3 0h1m2 0h1m1 0h3m1 0h1m2 0h3m1 0h4m4 0h3M6 28.5h2m1 0h2m1 0h2m1 0h4m1 0h1m1 0h1m1 0h2m1 0h4m1 0h3m1 0h1m1 0h3M5 29.5h2m2 0h1m6 0h3m1 0h2m1 0h2m2 0h2m2 0h6m1 0h1m1 0h1M5 30.5h7m1 0h1m4 0h10m1 0h2m7 0h2M4 31.5h1m1 0h1m2 0h1m2 0h1m1 0h4m3 0h1m3 0h1m1 0h1m3 0h3m1 0h1m4 0h1M7 32.5h1m1 0h6m2 0h1m1 0h1m3 0h2m1 0h1m2 0h1m2 0h5m1 0h2M12 33.5h2m1 0h1m2 0h1m1 0h2m2 0h2m1 0h3m1 0h2m3 0h3m1 0h1M4 34.5h7m1 0h3m4 0h2m3 0h3m5 0h1m1 0h1m1 0h2m1 0h2M4 35.5h1m5 0h1m3 0h2m1 0h3m1 0h4m5 0h3m3 0h2M4 36.5h1m1 0h3m1 0h1m2 0h1m3 0h5m1 0h4m3 0h1m1 0h6M4 37.5h1m1 0h3m1 0h1m1 0h3m1 0h1m2 0h2m2 0h2m3 0h1m1 0h1m1 0h1m1 0h5M4 38.5h1m1 0h3m1 0h1m1 0h1m1 0h2m1 0h1m2 0h1m1 0h2m1 0h3m1 0h4m1 0h4m1 0h1M4 39.5h1m5 0h1m4 0h1m2 0h1m5 0h1m2 0h1m1 0h1m1 0h1m1 0h1m4 0h1M4 40.5h7m4 0h4m4 0h1m4 0h3m2 0h3m1 0h4';

interface GetAppQrCodeProps {
  className?: string;
}

export function GetAppQrCode({ className }: GetAppQrCodeProps): ReactElement {
  return (
    // Scanners want dark modules on a light plate, so this stays white in both
    // themes instead of inheriting the popover surface. `text-black` also feeds
    // the logo, which draws in `currentColor`.
    <div
      className={classNames(
        'relative rounded-10 bg-white p-1 text-black',
        className,
      )}
    >
      <svg
        viewBox="0 0 45 45"
        shapeRendering="crispEdges"
        className="size-full"
        role="img"
        aria-label="QR code linking to the daily.dev mobile app"
      >
        <path stroke="currentColor" d={QR_MATRIX_PATH} />
      </svg>
      {/* Knockout badge for the brand mark. At a quarter of the code's width it
          obscures ~6% of the modules, well inside what level H recovers. The
          white ring stops the dark badge from merging into whichever modules
          happen to sit against it. */}
      <span className="absolute inset-0 m-auto flex size-1/4 items-center justify-center rounded-8 border-2 border-white bg-black text-white">
        {/* DailyIcon draws in `currentColor`, so the badge's `text-white` makes
            the mark white in both themes. The svg/LogoIcon variant hardcodes
            `--theme-text-primary` and would flip with the theme instead. The
            important modifiers override the Icon wrapper's fixed size so the
            mark scales with the badge. */}
        <DailyIcon className="!h-auto !w-3/4" />
      </span>
    </div>
  );
}

export default GetAppQrCode;
