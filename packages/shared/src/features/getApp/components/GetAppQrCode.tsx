import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { DailyIcon } from '../../../components/icons';
// A desktop visitor can't install a phone app from the machine they're on, so
// the header entry point hands them a scannable code instead of a dead-end
// store link. The asset is a pre-rendered SVG (see the regeneration note
// inside it) rather than a runtime QR library: the target URL never changes,
// so one static image beats shipping a generator in the header bundle. It
// lives under an `icons/` directory because the extension's rspack config
// only runs SVGR on paths matching `icons/`.
//
// Error correction is level H (recovers ~30% of the matrix) specifically so
// the centre can be knocked out for the logo badge below. Dropping back to
// level M would make the branded version unscannable.
import QrSvg from '../icons/getAppQr.svg';

interface GetAppQrCodeProps {
  className?: string;
}

export function GetAppQrCode({ className }: GetAppQrCodeProps): ReactElement {
  return (
    // Scanners want dark modules on a light plate, so this stays white in both
    // themes instead of inheriting the popover surface.
    <div
      className={classNames(
        'relative rounded-10 bg-white p-1 text-black',
        className,
      )}
    >
      <QrSvg
        className="size-full"
        role="img"
        aria-label="QR code linking to the daily.dev mobile app"
      />
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
