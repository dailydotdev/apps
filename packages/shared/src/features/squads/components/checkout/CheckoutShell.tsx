import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import { IconSize } from '../../../../components/Icon';
import { MoveToIcon, VIcon } from '../../../../components/icons';
import { FunnelGlassBar } from '../../../onboarding/shared/FunnelGlassBar';
import { AuthScreenTitle } from '../../../../components/auth/AuthScreenTitle';
import LogoIcon from '../../../../svg/LogoIcon';
import LogoText from '../../../../svg/LogoText';
import {
  startupsBaseCenter,
  startupsCrewOnBaseImage,
  startupsPlazaSky,
} from './StartupsCrewOnBase';

export enum CheckoutStage {
  Account = 'account',
  Company = 'company',
  Plan = 'plan',
  Setup = 'setup',
}

const stages: { id: CheckoutStage; label: string }[] = [
  { id: CheckoutStage.Account, label: 'Account' },
  { id: CheckoutStage.Company, label: 'Company' },
  { id: CheckoutStage.Plan, label: 'Plan' },
  { id: CheckoutStage.Setup, label: 'Set up' },
];

const LILAC = '#D8B4FE';

// The form starts at the same height on every screen, so nothing above a click
// ever moves. That height centres a typical form on the page: half the page, less
// half a form, less what's above it (40px padding, 76px header, 32px gap, 16px
// below). A screen too long for that starts right under the stepper.
// Concentric corners: the box's outer radius is its inner radius plus its padding.
const STAGE_PADDING = 8;
const STAGE_INNER_RADIUS = 18;
const STAGE_OUTER_RADIUS = STAGE_INNER_RADIUS + STAGE_PADDING;
const FORM_WIDTH = 440;

const SHELL_STYLES = `
.startups-form { padding-top: 16px; animation: startupsStep .2s cubic-bezier(.23,1,.32,1) both; }
@keyframes startupsStep { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
@keyframes startupsFade { from { opacity: 0; } to { opacity: 1; } }
.startups-shell button { transition: transform .12s cubic-bezier(.23,1,.32,1), background-color .15s ease-out, border-color .15s ease-out, color .15s ease-out; }
.startups-shell button:active:not(:disabled) { transform: scale(.97); }
.startups-shell button:focus-visible, .startups-shell a:focus-visible { outline: 2px solid ${LILAC}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .startups-form { animation-name: startupsFade; }
  .startups-shell button:active:not(:disabled) { transform: none; }
}
@media (min-width: 1020px) {
  .startups-form:not(.startups-form-tall) { margin-top: max(0px, calc(50dvh - 200px - 164px)); }
}
@media (max-width: 1019px) {
  .startups-form { padding-top: 0; }
}
.startups-wall-art { height: 50dvh; }
.startups-wall-image { width: 320%; bottom: 10%; }
@media (max-height: 759px) {
  .startups-wall-art { height: 32dvh; }
  .startups-wall-image { width: 220%; bottom: 0; }
}
@media (min-width: 1020px) {
  .startups-wall-art { display: none; }
  .startups-box {
    border-radius: ${STAGE_OUTER_RADIUS}px;
    padding: ${STAGE_PADDING}px;
    background: rgba(255,255,255,.07);
    box-shadow: inset 0 0 0 1px rgba(160,129,202,.32), 0 0 44px -20px rgba(160,129,202,.3);
  }
  .startups-box-inner {
    border-radius: ${STAGE_INNER_RADIUS}px;
    box-shadow: 0 0 0 1px rgba(255,255,255,.1);
    overflow-x: hidden;
    overflow-y: auto;
  }
}
@media (max-width: 1019px) {
  .startups-wall main { flex: 1; }
  .startups-wall main > div { justify-content: flex-end; gap: 24px; }
  .startups-wall header { align-items: center; }
  .startups-wall .startups-form { flex: none; text-align: center; }
  .startups-wall .startups-form p { text-align: center !important; }
  .startups-wall .startups-form .flex-wrap { justify-content: center; }
}
`;

const logoLabel = {
  background: 'rgba(192,132,252,.1)',
  border: '1px solid rgba(192,132,252,.2)',
  color: LILAC,
  fontSize: 10,
  lineHeight: '14px',
  letterSpacing: '0.5px',
  padding: '2px 6px',
  borderRadius: 12,
};

const CheckoutLogo = (): ReactElement => (
  <span
    className="flex shrink-0 items-center gap-1.5 laptop:gap-2"
    aria-label="daily.dev for Startups"
    role="img"
  >
    <span className="flex items-center">
      <LogoIcon className={{ container: 'h-logo' }} />
      <LogoText className={{ container: 'ml-1 h-logo' }} />
    </span>
    <span className="whitespace-nowrap font-bold uppercase" style={logoLabel}>
      Startups
    </span>
  </span>
);

/** Each finished step shows what was chosen, with a check. */
const CheckoutProgress = ({
  current,
  answers,
  isComplete,
}: {
  current: CheckoutStage;
  answers?: Partial<Record<CheckoutStage, string>>;
  isComplete?: boolean;
}): ReactElement => {
  const currentIndex = isComplete
    ? stages.length
    : stages.findIndex(({ id }) => id === current);

  return (
    <nav
      aria-label="Progress"
      className={classNames(
        'w-full',
        current === CheckoutStage.Account && 'hidden laptop:block',
      )}
    >
      <ol className="flex w-full flex-wrap items-center justify-center gap-1.5 laptop:justify-start">
        {stages.map((stage, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={stage.id} aria-current={isCurrent ? 'step' : undefined}>
              <span
                className={classNames(
                  'flex h-8 items-center gap-1 whitespace-nowrap rounded-10 px-2.5 font-bold typo-footnote',
                  isDone && 'bg-surface-float text-text-primary',
                  !isDone && !isCurrent && 'text-text-quaternary',
                )}
                style={
                  isCurrent
                    ? { background: LILAC, color: '#0F0F12' }
                    : undefined
                }
              >
                {isDone && (
                  <VIcon
                    size={IconSize.Size16}
                    className="text-accent-avocado-default"
                    secondary
                  />
                )}
                <span className="block truncate" style={{ maxWidth: 120 }}>
                  {isDone ? (answers?.[stage.id] ?? stage.label) : stage.label}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export const CheckoutTitle = AuthScreenTitle;

/** The step's primary action, the funnel's double-border button. */
export const CheckoutCta = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => <FunnelGlassBar>{children}</FunnelGlassBar>;

export const CheckoutSkeleton = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <ElementPlaceholder
    aria-hidden
    className={classNames('shrink-0 animate-pulse', className)}
  />
);

export interface CheckoutBack {
  label: string;
  onClick: () => void;
}

interface CheckoutShellProps {
  current: CheckoutStage;
  answers?: Partial<Record<CheckoutStage, string>>;
  isComplete?: boolean;
  /** Too long to centre, so it starts right under the stepper. */
  isTall?: boolean;
  /** On a phone, the art and centred form of our sign-up wall. */
  isPhoneWall?: boolean;
  /** On a phone, back is an icon beside the logo. */
  phoneBack?: CheckoutBack;
  /** What fills the box on the right. */
  aside?: ReactNode;
  /** On a phone, the aside replaces the form. */
  isAsideOnPhone?: boolean;
  children: ReactNode;
}

/**
 * Two equal columns, as on the panel sign-up wall, with the form on the left and
 * a double-border box on the right that supports the current step.
 */
export const CheckoutShell = ({
  current,
  answers,
  isComplete,
  isTall,
  isPhoneWall,
  phoneBack,
  aside,
  isAsideOnPhone,
  children,
}: CheckoutShellProps): ReactElement => (
  <div
    className={classNames(
      isPhoneWall && 'startups-wall',
      'startups-shell relative isolate flex min-h-dvh w-full flex-col bg-background-default text-text-primary laptop:grid laptop:grid-cols-2',
    )}
  >
    <style dangerouslySetInnerHTML={{ __html: SHELL_STYLES }} />
    {isPhoneWall && (
      <div
        aria-hidden
        className="startups-wall-art pointer-events-none absolute inset-x-0 top-0 select-none overflow-hidden"
        style={{ background: startupsPlazaSky }}
      >
        <img
          src={startupsCrewOnBaseImage}
          alt=""
          className="startups-wall-image absolute"
          style={{
            left: '50%',
            maxWidth: 'none',
            transform: `translateX(-${startupsBaseCenter}%)`,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: '32%',
            background:
              'linear-gradient(180deg, transparent, var(--theme-background-default))',
          }}
        />
      </div>
    )}
    <main
      id="main-content"
      tabIndex={-1}
      className={classNames(
        'relative z-1 min-w-0 flex-col items-center px-5 py-6 laptop:flex laptop:min-h-dvh laptop:px-10 laptop:py-10',
        isAsideOnPhone ? 'hidden' : 'flex',
      )}
    >
      <div
        className="flex w-full flex-1 flex-col gap-8"
        style={{ maxWidth: FORM_WIDTH }}
      >
        <header className="flex flex-col gap-6">
          <div className="relative flex items-center justify-center laptop:justify-start">
            {phoneBack && (
              <Button
                aria-label={phoneBack.label}
                className="absolute laptop:hidden"
                style={{ left: -8 }}
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Medium}
                icon={
                  <MoveToIcon size={IconSize.Size16} className="rotate-180" />
                }
                onClick={phoneBack.onClick}
              />
            )}
            <CheckoutLogo />
          </div>
          <CheckoutProgress
            current={current}
            answers={answers}
            isComplete={isComplete}
          />
        </header>
        <div
          key={current}
          className={classNames(
            'startups-form flex flex-col gap-6',
            isTall && 'startups-form-tall',
          )}
        >
          {children}
        </div>
      </div>
    </main>
    {aside && (
      <aside
        className={classNames(
          'relative min-w-0 laptop:sticky laptop:top-0 laptop:block laptop:h-dvh laptop:p-10',
          isAsideOnPhone ? 'block' : 'hidden',
        )}
      >
        <div className="startups-box relative h-full w-full">
          <div className="startups-box-inner h-full bg-background-default">
            {aside}
          </div>
        </div>
      </aside>
    )}
  </div>
);
