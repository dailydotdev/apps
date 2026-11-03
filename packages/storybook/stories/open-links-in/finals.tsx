import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MoonIcon } from '@dailydotdev/shared/src/components/icons/Moon';
import { SunIcon } from '@dailydotdev/shared/src/components/icons/Sun';
import { ThemeAutoIcon } from '@dailydotdev/shared/src/components/icons/ThemeAuto';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons/Copy';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons/OpenLink';
import { CompassIcon } from '@dailydotdev/shared/src/components/icons/Compass';
import { LockIcon } from '@dailydotdev/shared/src/components/icons/Lock';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { RefreshIcon } from '@dailydotdev/shared/src/components/icons/Refresh';
import { UploadIcon } from '@dailydotdev/shared/src/components/icons/Upload';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ShellSquare } from '@dailydotdev/shared/src/components/shell/ShellSquare';
import { BrowserChrome, Phone } from './kit';
import { copy } from './data';

// The decided screens (round 75), drawn with production's own pieces: the
// settings page from its Switch, Radio, Typography and theme buttons with
// the Appearance page's exact structure; the reader menu as the shared
// Drawer renders a sheet, over the simulator capture of the real reader;
// the iOS Settings bundle over the real Settings page for daily.dev.
// View in the dark theme to see them as the app shows them.

const Chip = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 font-bold text-text-tertiary typo-footnote hover:text-text-primary"
  >
    {children}
  </button>
);

// AccountPageContainer on a phone: the shell's back square and the leaf
// title in the top row, then the page section with its 16px padding.
const LeafHeader = ({ title }: { title: string }): ReactElement => (
  <div className="flex h-[3.25rem] shrink-0 items-center gap-3 px-4">
    <ShellSquare aria-label="Back">
      <ArrowIcon size={IconSize.Small} className="-rotate-90" />
    </ShellSquare>
    <h1 className="min-w-0 flex-1 truncate font-bold typo-title3">{title}</h1>
  </div>
);

enum ThemeMode {
  Dark = 'dark',
  Light = 'light',
  Auto = 'auto',
}

const themeIcons = [
  [ThemeMode.Dark, MoonIcon],
  [ThemeMode.Light, SunIcon],
  [ThemeMode.Auto, ThemeAutoIcon],
] as const;

// ThemeSection without its settings context.
const ThemeRow = (): ReactElement => {
  const [mode, setMode] = useState<ThemeMode>(ThemeMode.Dark);

  return (
    <section className="flex items-center justify-between">
      <Typography
        color={TypographyColor.Tertiary}
        type={TypographyType.Subhead}
      >
        Theme
      </Typography>
      <ButtonGroup>
        {themeIcons.map(([value, Icon]) => {
          const active = value === mode;
          return (
            <Button
              key={value}
              icon={<Icon secondary={active} />}
              variant={active ? ButtonVariant.Float : ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              onClick={() => setMode(value)}
              className={active ? 'text-text-primary' : undefined}
            />
          );
        })}
      </ButtonGroup>
    </section>
  );
};

// SettingsSwitch from the settings layout, one to one.
const SettingsSwitch = ({
  name,
  children,
  checked,
  onToggle,
}: {
  name: string;
  children: ReactNode;
  checked: boolean;
  onToggle: () => void;
}): ReactElement => {
  const labelId = `${name}-label`;

  return (
    <div className="flex justify-between gap-4">
      <Typography
        id={labelId}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="flex-1"
      >
        {children}
      </Typography>
      <Switch
        inputId={`${name}-switch`}
        name={name}
        compact={false}
        aria-labelledby={labelId}
        checked={checked}
        onToggle={onToggle}
      />
    </div>
  );
};

export enum FinalSurface {
  Ios = 'ios',
  Android = 'android',
  Browser = 'browser',
}

const choicesFor: Record<FinalSurface, [string, string][]> = {
  [FinalSurface.Ios]: copy.appChoices,
  [FinalSurface.Android]: copy.androidChoices,
  [FinalSurface.Browser]: copy.browserChoices,
};

const preferenceRows = [
  'Show feed sorting menu',
  'Show companion widget on external sites',
  'Show hero cards for highlighted news',
  'Show widgets above the feed',
  'Show feedback button',
];

// Appearance as it would ship: Theme, Preferences without the two Open
// links rows, Accessibility, then the Reading group at the end with the one
// control whose rows follow the surface.
export const FinalAppearance = ({
  surface = FinalSurface.Ios,
}: {
  surface?: FinalSurface;
}): ReactElement => {
  const choices = choicesFor[surface];
  const [value, setValue] = useState(choices[0][0]);
  const [on, setOn] = useState<Record<string, boolean>>(
    Object.fromEntries(preferenceRows.map((row) => [row, true])),
  );
  const [autoHide, setAutoHide] = useState(false);

  return (
    <Phone
      browser={
        surface === FinalSurface.Browser
          ? BrowserChrome.Safari
          : BrowserChrome.None
      }
      height={surface === FinalSurface.Browser ? 940 : 850}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-default">
        <LeafHeader title="Appearance" />
        <section className="map-scroll-none flex min-h-0 w-full flex-1 flex-col overflow-y-auto p-4">
          <div className="flex flex-col gap-6">
            <ThemeRow />
            <div className="flex flex-col gap-5">
              <Typography bold type={TypographyType.Subhead}>
                Preferences
              </Typography>
              {preferenceRows.map((row) => (
                <SettingsSwitch
                  key={row}
                  name={`${surface}-${row.replace(/\W+/g, '-').toLowerCase()}`}
                  checked={on[row]}
                  onToggle={() =>
                    setOn((state) => ({ ...state, [row]: !state[row] }))
                  }
                >
                  {row}
                </SettingsSwitch>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <Typography bold type={TypographyType.Subhead}>
                Accessibility
              </Typography>
              <SettingsSwitch
                name={`${surface}-auto-dismiss`}
                checked={autoHide}
                onToggle={() => setAutoHide((state) => !state)}
              >
                Auto-hide notifications after a few seconds
              </SettingsSwitch>
            </div>
            <div className="flex flex-col gap-5">
              <Typography bold type={TypographyType.Subhead}>
                {copy.settingsGroup}
              </Typography>
              <div className="flex flex-col gap-3">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  {copy.settingsLabel}
                </Typography>
                <Radio
                  name={`${surface}-open-links-in`}
                  value={value}
                  onChange={setValue}
                  // The notifications page's list (PersonalizedDigest): the
                  // circle on the right, a bold label with its footnote.
                  reverse
                  className={{
                    label: 'w-[calc(100%-2.4rem)]',
                    content: 'w-full !pr-0',
                    container: 'gap-4',
                  }}
                  options={choices.map(([label, helper]) => ({
                    value: label,
                    label: (
                      <>
                        <Typography
                          bold
                          type={TypographyType.Callout}
                          color={TypographyColor.Primary}
                        >
                          {label}
                        </Typography>
                        <Typography
                          type={TypographyType.Footnote}
                          color={TypographyColor.Tertiary}
                          className="text-wrap font-normal"
                        >
                          {helper}
                        </Typography>
                      </>
                    ),
                  }))}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </Phone>
  );
};

// ReadingDrawer's MenuRow, one to one.
const MenuRow = ({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}): ReactElement => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="flex h-12 w-full items-center gap-3 px-4 text-left text-text-primary typo-callout disabled:text-text-disabled"
  >
    {icon}
    {label}
  </button>
);

// The page menu as the shared Drawer draws a sheet (grabber, title, rows,
// the safe-area foot) over the simulator capture of the reader, with the
// two decided rows and without the close square: the app's other sheets
// have none, the grabber and a swipe down close them (Tsahi, 3 Nov).
export const FinalReaderMenu = (): ReactElement => {
  const [open, setOpen] = useState(true);
  const [always, setAlways] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Phone browser={BrowserChrome.None} statusBar={false} height={815}>
        <div className="relative flex min-h-0 flex-1 flex-col">
          <img
            src="open-links-in/today-reading.png"
            alt="The reader, captured on the simulator"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          {open && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div
              className="absolute inset-0 bg-overlay-quaternary-onion"
              onClick={() => setOpen(false)}
            >
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
              <div
                role="dialog"
                aria-modal="true"
                aria-label="m.youtube.com"
                className="absolute inset-x-0 bottom-0 flex w-full flex-col rounded-t-16 bg-background-default"
                onClick={(event) => event.stopPropagation()}
              >
                <div
                  aria-hidden
                  className="flex shrink-0 justify-center pb-1 pt-3"
                >
                  <span className="h-1 w-9 rounded-2 bg-border-subtlest-secondary" />
                </div>
                <h3 className="flex h-[2.375rem] shrink-0 flex-row items-center px-4 font-bold typo-title3">
                  <span className="min-w-0 flex-1 truncate">m.youtube.com</span>
                </h3>
                <div className="flex min-h-0 w-full flex-1 flex-col py-1">
                  <MenuRow
                    icon={
                      <ArrowIcon size={IconSize.Small} className="-rotate-90" />
                    }
                    label="Back"
                    disabled
                  />
                  <MenuRow
                    icon={
                      <ArrowIcon size={IconSize.Small} className="rotate-90" />
                    }
                    label="Forward"
                    disabled
                  />
                  <MenuRow
                    icon={<CopyIcon size={IconSize.Small} />}
                    label="Copy link"
                  />
                  <MenuRow
                    icon={<OpenLinkIcon size={IconSize.Small} />}
                    label={copy.menuRow}
                    onClick={() => setOpen(false)}
                  />
                  <div className="mx-4 my-1 border-t border-border-subtlest-tertiary" />
                  <div className="flex h-12 w-full items-center gap-3 px-4 text-text-primary typo-callout">
                    <CompassIcon size={IconSize.Small} />
                    <span className="flex-1">{copy.alwaysRow}</span>
                    <Switch
                      inputId="final-always-safari"
                      name="final-always-safari"
                      compact={false}
                      aria-label={copy.alwaysRow}
                      checked={always}
                      onToggle={() => setAlways((state) => !state)}
                    />
                  </div>
                </div>
                <div aria-hidden className="h-3 shrink-0" />
              </div>
            </div>
          )}
        </div>
      </Phone>
      <div className="flex flex-wrap items-center gap-2">
        <Chip onClick={() => setOpen((state) => !state)}>
          {open ? 'Close the menu' : 'Open the page menu'}
        </Chip>
        <Chip onClick={() => setAlways(false)}>Reset the switch</Chip>
      </div>
    </div>
  );
};

// The controls band with the Share square (Tsahi, 3 Nov): ReadingDrawer's
// own markup (ShellSquare, the page-name pill) drawn over the capture at
// the band's position, so the old band sits under the new one. Share opens
// the system share sheet with the page, as the capsule's share does for a
// post: apps, Copy, and the browsers on the phone. The glyph is the system
// share glyph, the tray with the arrow up (the Upload icon), as X draws it.
const shareSheetApps = ['AirDrop', 'Messages', 'WhatsApp', 'Slack', 'Mail'];
const shareSheetActions = [
  'Copy',
  'Open in Safari',
  'Add to Reading List',
  'Add Bookmark',
];

export const FinalReaderControls = (): ReactElement => {
  const [sheet, setSheet] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Phone browser={BrowserChrome.None} statusBar={false} height={815}>
        <div className="relative flex min-h-0 flex-1 flex-col">
          <img
            src="open-links-in/today-reading.png"
            alt="The reader, captured on the simulator"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div
            className="absolute inset-x-0 z-2 grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 px-4"
            style={{ top: 649 }}
          >
            <ShellSquare aria-label="Close">
              <MiniCloseIcon size={IconSize.Small} />
            </ShellSquare>
            <button
              type="button"
              aria-label="Page options"
              className="shell-material shell-press shell-hit flex h-[2.375rem] min-w-0 max-w-full items-center gap-1.5 justify-self-center rounded-14 px-3 text-text-primary typo-footnote"
            >
              <LockIcon size={IconSize.XSmall} className="text-text-tertiary" />
              <span className="truncate font-bold">m.youtube.com</span>
              <MenuIcon
                size={IconSize.XSmall}
                className="text-text-secondary"
              />
            </button>
            <ShellSquare
              aria-label="Share the page"
              onClick={() => setSheet(true)}
            >
              <UploadIcon size={IconSize.Small} />
            </ShellSquare>
            <ShellSquare aria-label="Reload">
              <RefreshIcon size={IconSize.Small} />
            </ShellSquare>
          </div>
          {sheet && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div
              className="absolute inset-0 z-3 bg-overlay-quaternary-onion"
              onClick={() => setSheet(false)}
            >
              <div className="absolute inset-x-2 bottom-2 flex flex-col gap-3 rounded-[1.625rem] bg-background-subtle px-4 pb-6 pt-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-surface-float">
                    <LockIcon
                      size={IconSize.Small}
                      className="text-text-tertiary"
                    />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-bold typo-callout">
                      I applied to 1,200 dev jobs and that&apos;s it, man.
                    </span>
                    <span className="truncate text-text-tertiary typo-footnote">
                      m.youtube.com
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  {shareSheetApps.map((app) => (
                    <span
                      key={app}
                      className="flex w-14 flex-col items-center gap-1"
                    >
                      <span className="size-12 rounded-14 bg-surface-float" />
                      <span className="truncate text-text-secondary typo-caption2">
                        {app}
                      </span>
                    </span>
                  ))}
                </div>
                <div className="flex flex-col divide-y divide-border-subtlest-tertiary rounded-16 bg-surface-float">
                  {shareSheetActions.map((action) => (
                    <span
                      key={action}
                      className="flex h-11 items-center justify-between px-4 typo-callout"
                    >
                      {action}
                      {action === 'Open in Safari' && (
                        <CompassIcon
                          size={IconSize.Small}
                          className="text-text-tertiary"
                        />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Phone>
      <div className="flex flex-wrap items-center gap-2">
        <Chip onClick={() => setSheet((state) => !state)}>
          {sheet ? 'Close the share sheet' : 'Tap Share'}
        </Chip>
      </div>
    </div>
  );
};

const iosLabels = ['In daily.dev', 'In Safari'];

// The Settings bundle: a Reading group under the access permissions on the
// real Settings page for daily.dev, and the list it opens.
export const FinalIosSettings = (): ReactElement => {
  const [level, setLevel] = useState(0);
  const [choice, setChoice] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <Phone browser={BrowserChrome.None} statusBar={false} height={815}>
        <div className="relative flex min-h-0 flex-1 flex-col">
          {level === 0 ? (
            <>
              <img
                src="open-links-in/ios-settings.png"
                alt="iOS Settings, daily.dev, captured on the simulator"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
              <div
                className="absolute inset-x-0 flex flex-col gap-2"
                style={{ top: 372 }}
              >
                <span className="px-[1.875rem] font-bold text-text-tertiary typo-body">
                  Reading
                </span>
                <div className="mx-4 rounded-[1.625rem] bg-surface-float">
                  <button
                    type="button"
                    onClick={() => setLevel(1)}
                    className="flex h-12 w-full items-center gap-3 px-3 text-left typo-body"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-6 bg-accent-blueCheese-default text-text-primary">
                      <CompassIcon size={IconSize.XSmall} />
                    </span>
                    <span className="flex-1">Open links</span>
                    <span className="text-text-tertiary">
                      {iosLabels[choice]}
                    </span>
                    <ArrowIcon
                      size={IconSize.Small}
                      className="rotate-90 text-text-quaternary"
                    />
                  </button>
                </div>
                <span className="px-[1.875rem] text-text-tertiary typo-footnote">
                  The same choice as Settings, Appearance in the app. A change
                  here is read the next time you open daily.dev.
                </span>
              </div>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col bg-background-default pt-14">
              <div className="flex h-11 shrink-0 items-center px-4">
                <button
                  type="button"
                  onClick={() => setLevel(0)}
                  aria-label="Back to daily.dev"
                  className="flex size-10 items-center justify-center rounded-max bg-surface-float"
                >
                  <ArrowIcon size={IconSize.Medium} className="-rotate-90" />
                </button>
                <span className="flex-1 pr-10 text-center font-bold typo-body">
                  Open links
                </span>
              </div>
              <div className="mx-4 mt-8 flex flex-col divide-y divide-border-subtlest-tertiary rounded-[1.625rem] bg-surface-float">
                {iosLabels.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setChoice(index);
                      setLevel(0);
                    }}
                    className={classNames(
                      'flex h-12 w-full items-center px-4 text-left typo-body',
                    )}
                  >
                    <span className="flex-1">{label}</span>
                    {index === choice && (
                      <span className="font-bold text-text-link">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <span className="mt-2 px-[1.875rem] text-text-tertiary typo-footnote">
                In daily.dev opens the article over the post. In Safari leaves
                the app for every link.
              </span>
            </div>
          )}
        </div>
      </Phone>
      <div className="flex flex-wrap items-center gap-2">
        <Chip onClick={() => setLevel(level === 0 ? 1 : 0)}>
          {level === 0 ? 'Open the list' : 'Back to daily.dev'}
        </Chip>
      </div>
    </div>
  );
};
