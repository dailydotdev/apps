import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useId, useState } from 'react';
import { NextSeo } from 'next-seo';
import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { LegacyCheckbox } from '../../components/devCheckboxRadio/LegacyCheckbox';
import { LegacyRadio } from '../../components/devCheckboxRadio/LegacyRadio';

/**
 * /dev/checkbox-radio — internal review surface for the Checkbox + Radio
 * redesign that aligns them with the Toggle/Switch and Button system.
 *
 * Side-by-side PREVIOUS vs NEW across every state and variant, in light and
 * dark. Hover / focus / press are live — interact with any control to see
 * those states. Carries `noindex`/`nofollow`; reachable on preview + local
 * but blocked on the canonical production host.
 */

// --- Theme + gating --------------------------------------------------------

const useTheme = (initial: 'dark' | 'light') => {
  const [theme, setTheme] = useState<'dark' | 'light'>(initial);
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);
  return [theme, setTheme] as const;
};

const useReviewAllowed = (): boolean => {
  const [allowed, setAllowed] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const { hostname } = window.location;
    // Block the canonical production hosts only; allow localhost and the
    // *.preview.app.daily.dev preview deployments so reviewers can open it.
    setAllowed(hostname !== 'app.daily.dev' && hostname !== 'www.daily.dev');
  }, []);
  return allowed;
};

// --- Interactive wrappers (own their state so states are live) -------------

const InteractiveCheckbox = ({
  variant,
  checked: initial,
  indeterminate,
  ...props
}: {
  variant: 'previous' | 'new';
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  checkmarkClassName?: string;
  'aria-label'?: string;
}) => {
  const id = useId();
  const [checked, setChecked] = useState(Boolean(initial));

  // `indeterminate` only exists on the new checkbox, so branch rather than
  // forwarding it into the legacy snapshot.
  if (variant === 'previous') {
    return (
      <LegacyCheckbox
        {...props}
        name={id}
        checked={checked}
        onToggleCallback={(next) => setChecked(next)}
      />
    );
  }

  return (
    <Checkbox
      {...props}
      name={id}
      checked={checked}
      indeterminate={indeterminate}
      onToggleCallback={(next) => setChecked(next)}
    />
  );
};

const RADIO_OPTIONS = [
  { label: 'Daily digest', value: 'digest' },
  { label: 'Weekly summary', value: 'weekly' },
  { label: 'Off', value: 'off' },
];

const InteractiveRadio = ({
  variant,
  initial = 'digest',
  disabled,
  reverse,
  valid,
  options = RADIO_OPTIONS,
  container,
}: {
  variant: 'previous' | 'new';
  initial?: string;
  disabled?: boolean;
  reverse?: boolean;
  valid?: boolean;
  options?: { label: string; value: string; afterElement?: ReactNode }[];
  container?: string;
}) => {
  const name = useId();
  const [value, setValue] = useState(initial);
  const Component = variant === 'previous' ? LegacyRadio : Radio;
  return (
    <Component
      name={name}
      options={options}
      value={value}
      onChange={setValue}
      disabled={disabled}
      reverse={reverse}
      valid={valid}
      className={{ container }}
    />
  );
};

// --- Layout primitives -----------------------------------------------------

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="mb-12">
    <header className="mb-4 border-b border-border-subtlest-tertiary pb-2">
      <h2 className="font-bold text-text-primary typo-title2">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-3xl text-text-secondary typo-callout">
          {description}
        </p>
      ) : null}
    </header>
    {children}
  </section>
);

const tableGrid = { gridTemplateColumns: '240px 1fr 1fr' } as const;

const TableHeader = () => (
  <div className="grid items-center gap-4 px-4 pb-2" style={tableGrid}>
    <span className="uppercase tracking-wide text-text-tertiary typo-caption1">
      State / variant
    </span>
    <span className="font-bold uppercase tracking-wide text-text-tertiary typo-footnote">
      Previous
    </span>
    <span className="font-bold uppercase tracking-wide text-accent-cabbage-default typo-footnote">
      New design
    </span>
  </div>
);

const TableRow = ({
  title,
  caption,
  previous,
  next,
  align = 'center',
}: {
  title: string;
  caption?: string;
  previous: ReactNode;
  next: ReactNode;
  align?: 'center' | 'start';
}) => (
  <div
    className="grid gap-4 rounded-12 border border-border-subtlest-tertiary p-4 odd:bg-surface-float"
    style={{
      ...tableGrid,
      alignItems: align === 'center' ? 'center' : 'start',
    }}
  >
    <div className="flex flex-col gap-0.5">
      <span className="font-bold text-text-primary typo-callout">{title}</span>
      {caption ? (
        <span className="text-text-tertiary typo-caption1">{caption}</span>
      ) : null}
    </div>
    <div className="flex border-r border-border-subtlest-tertiary pr-4">
      {previous}
    </div>
    <div className="flex">{next}</div>
  </div>
);

const Table = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-2">
    <TableHeader />
    {children}
  </div>
);

// --- Page ------------------------------------------------------------------

const CheckboxRadioDevPage = (): ReactElement => {
  const [theme, setTheme] = useTheme('dark');
  const allowed = useReviewAllowed();

  if (!allowed) {
    return (
      <>
        <NextSeo nofollow noindex title="Checkbox & Radio review · daily.dev" />
        <div className="flex min-h-screen items-center justify-center bg-background-default p-12">
          <p className="text-text-secondary typo-callout">
            This review page is only available on preview and local builds.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <NextSeo nofollow noindex title="Checkbox & Radio review · daily.dev" />
      <div className="min-h-screen bg-background-default text-text-primary">
        {/* Sticky controls bar */}
        <div className="bg-background-default/95 sticky top-0 z-header border-b border-border-subtlest-tertiary px-6 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-bold typo-callout">
              Checkbox &amp; Radio · PREVIOUS vs NEW
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-text-tertiary typo-caption1">Theme</span>
              <select
                className="rounded-6 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 text-text-primary typo-callout"
                value={theme}
                onChange={(event) =>
                  setTheme(event.target.value as 'dark' | 'light')
                }
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <span className="text-text-quaternary typo-caption1">
              Hover, click &amp; hold (press), and Tab (focus ring) are live on
              every control.
            </span>
          </div>
        </div>

        <main className="max-w-screen-xl mx-auto w-full px-6 py-8">
          <header className="mb-10 flex flex-col gap-2">
            <span className="uppercase tracking-wide text-text-quaternary typo-footnote">
              Design system · Review
            </span>
            <h1 className="font-bold typo-title1">
              Checkbox &amp; Radio — before &amp; after
            </h1>
            <p className="max-w-3xl text-text-tertiary typo-body">
              The checkbox and radio were realigned with the redesigned
              Toggle/Switch and the Button system so fields, buttons, toggles,
              checkboxes and radios read as one family. The new design uses a
              single semantic brand fill when selected (
              <code>accent-cabbage-default</code>) with a solid white glyph, a{' '}
              <code>surface-hover</code> halo, a <code>surface-focus</code> blue
              keyboard ring, and a subtle press squeeze — all theme-aware with
              no per-theme overrides. Toggle the theme above and interact with
              each control to review hover, focus and press.
            </p>
          </header>

          {/* ---------------- Checkbox ---------------- */}
          <Section
            title="Checkbox · states"
            description="Each row renders the same props on the previous and the new checkbox. Click to toggle; hover, focus (Tab) and press are live."
          >
            <Table>
              <TableRow
                title="Unchecked"
                caption="resting"
                previous={
                  <InteractiveCheckbox variant="previous">
                    Checkbox label
                  </InteractiveCheckbox>
                }
                next={
                  <InteractiveCheckbox variant="new">
                    Checkbox label
                  </InteractiveCheckbox>
                }
              />
              <TableRow
                title="Checked"
                caption="brand fill + white glyph"
                previous={
                  <InteractiveCheckbox variant="previous" checked>
                    Checkbox label
                  </InteractiveCheckbox>
                }
                next={
                  <InteractiveCheckbox variant="new" checked>
                    Checkbox label
                  </InteractiveCheckbox>
                }
              />
              <TableRow
                title="Disabled · unchecked"
                previous={
                  <InteractiveCheckbox variant="previous" disabled>
                    Checkbox label
                  </InteractiveCheckbox>
                }
                next={
                  <InteractiveCheckbox variant="new" disabled>
                    Checkbox label
                  </InteractiveCheckbox>
                }
              />
              <TableRow
                title="Disabled · checked"
                previous={
                  <InteractiveCheckbox variant="previous" checked disabled>
                    Checkbox label
                  </InteractiveCheckbox>
                }
                next={
                  <InteractiveCheckbox variant="new" checked disabled>
                    Checkbox label
                  </InteractiveCheckbox>
                }
              />
              <TableRow
                title="Indeterminate"
                caption='mixed — aria-checked="mixed" (new only)'
                previous={
                  <span className="text-text-quaternary typo-footnote">
                    — not supported
                  </span>
                }
                next={
                  <InteractiveCheckbox variant="new" indeterminate>
                    Checkbox label
                  </InteractiveCheckbox>
                }
              />
            </Table>
          </Section>

          <Section
            title="Checkbox · variants"
            description="Layout/label variants used across the product."
          >
            <Table>
              <TableRow
                title="No label"
                caption="aria-label only"
                previous={
                  <InteractiveCheckbox
                    variant="previous"
                    checked
                    aria-label="Checkbox"
                  />
                }
                next={
                  <InteractiveCheckbox
                    variant="new"
                    checked
                    aria-label="Checkbox"
                  />
                }
              />
              <TableRow
                title="Long label"
                caption="wraps with the box pinned top"
                align="start"
                previous={
                  <div className="max-w-xs">
                    <InteractiveCheckbox variant="previous" checked>
                      A longer checkbox label that wraps onto multiple lines to
                      verify alignment.
                    </InteractiveCheckbox>
                  </div>
                }
                next={
                  <div className="max-w-xs">
                    <InteractiveCheckbox variant="new" checked>
                      A longer checkbox label that wraps onto multiple lines to
                      verify alignment.
                    </InteractiveCheckbox>
                  </div>
                }
              />
              <TableRow
                title="Custom spacing"
                caption='checkmarkClassName="!mr-0"'
                previous={
                  <InteractiveCheckbox
                    variant="previous"
                    checked
                    checkmarkClassName="!mr-0"
                    aria-label="Checkbox"
                  />
                }
                next={
                  <InteractiveCheckbox
                    variant="new"
                    checked
                    checkmarkClassName="!mr-0"
                    aria-label="Checkbox"
                  />
                }
              />
            </Table>
          </Section>

          {/* ---------------- Radio ---------------- */}
          <Section
            title="Radio · states"
            description="Selected becomes a solid brand disc with a white center dot. Click an option to select it; hover, focus (Tab) and press are live."
          >
            <Table>
              <TableRow
                title="With selection"
                caption="first option selected"
                align="start"
                previous={
                  <InteractiveRadio variant="previous" initial="digest" />
                }
                next={<InteractiveRadio variant="new" initial="digest" />}
              />
              <TableRow
                title="No selection"
                caption="nothing selected yet"
                align="start"
                previous={<InteractiveRadio variant="previous" initial="" />}
                next={<InteractiveRadio variant="new" initial="" />}
              />
              <TableRow
                title="Disabled"
                caption="whole group disabled"
                align="start"
                previous={
                  <InteractiveRadio
                    variant="previous"
                    initial="digest"
                    disabled
                  />
                }
                next={
                  <InteractiveRadio variant="new" initial="digest" disabled />
                }
              />
            </Table>
          </Section>

          <Section
            title="Radio · variants"
            description="Direction, validation and inline layouts."
          >
            <Table>
              <TableRow
                title="Reverse"
                caption="control after the label"
                align="start"
                previous={
                  <InteractiveRadio
                    variant="previous"
                    initial="weekly"
                    reverse
                  />
                }
                next={
                  <InteractiveRadio variant="new" initial="weekly" reverse />
                }
              />
              <TableRow
                title="Invalid"
                caption="valid={false} — error labels"
                align="start"
                previous={
                  <InteractiveRadio
                    variant="previous"
                    initial=""
                    valid={false}
                  />
                }
                next={
                  <InteractiveRadio variant="new" initial="" valid={false} />
                }
              />
              <TableRow
                title="Inline"
                caption="horizontal group"
                align="start"
                previous={
                  <InteractiveRadio
                    variant="previous"
                    initial="digest"
                    container="!flex-row gap-4"
                  />
                }
                next={
                  <InteractiveRadio
                    variant="new"
                    initial="digest"
                    container="!flex-row gap-4"
                  />
                }
              />
            </Table>
          </Section>
        </main>
      </div>
    </>
  );
};

CheckboxRadioDevPage.getLayout = (page: ReactNode): ReactNode => page;

export default CheckboxRadioDevPage;
