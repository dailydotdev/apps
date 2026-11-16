import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import { AuthScreenTitle } from '../../../components/auth/AuthScreenTitle';
import SignupDisclaimer from '../../../components/auth/SignupDisclaimer';
import Logo, { LogoPosition } from '../../../components/Logo';
import {
  ThemeMode,
  useSettingsContext,
} from '../../../contexts/SettingsContext';
import {
  StartupsCrewOnBase,
  startupsPlazaSky,
} from '../../squads/components/checkout/StartupsCrewOnBase';
import type { AgentOnboardingEntryState } from '../hooks/useAgentOnboardingEntry';
import { agentOnboardingSteps } from '../howItWorks';
import { AgentSignupModes } from './AgentOnboardingEntry';

// Concentric corners: the box's outer radius is its inner radius plus its padding.
const BOX_PADDING = 8;
const BOX_INNER_RADIUS = 18;

const boxStyle = {
  borderRadius: BOX_INNER_RADIUS + BOX_PADDING,
  padding: BOX_PADDING,
  background: 'rgba(255,255,255,.07)',
  boxShadow:
    'inset 0 0 0 1px rgba(160,129,202,.32), 0 0 44px -20px rgba(160,129,202,.3)',
};

const boxInnerStyle = {
  borderRadius: BOX_INNER_RADIUS,
  boxShadow: '0 0 0 1px rgba(255,255,255,.1)',
};

const LILAC = '#D8B4FE';
// The crew fills the bottom of the box, and the art scales with the box's
// width, so the text centres in what is left above it.
const CREW_HEIGHT = '42%';

const headlineStyle = {
  fontSize: 'clamp(1.5rem, 4.2vh, 2.25rem)',
  lineHeight: 1.05,
};

const AgentSteps = (): ReactElement => (
  <div className="flex w-full max-w-[26rem] flex-col gap-8">
    <p className="text-balance font-bold tracking-tight" style={headlineStyle}>
      Your feed, set up by your agent.
    </p>
    <ol className="flex flex-col gap-5">
      {agentOnboardingSteps.map(({ title, description }, index) => (
        <li key={title} className="flex gap-4">
          <span
            className="w-5 shrink-0 font-bold tabular-nums typo-title3"
            style={{ color: LILAC }}
          >
            {index + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="font-bold typo-body">{title}</p>
            <p className="text-pretty typo-callout" style={{ opacity: 0.7 }}>
              {description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  </div>
);

type AgentSignupWallProps = {
  entry: AgentOnboardingEntryState;
  headline?: string | null;
  forceDarkTheme?: boolean;
  children: ReactNode;
};

/**
 * The sign-up wall of the agent experiment: the form on the left, and a
 * double-border box on the right that supports the chosen way to sign up.
 */
export const AgentSignupWall = ({
  entry,
  headline,
  forceDarkTheme = true,
  children,
}: AgentSignupWallProps): ReactElement => {
  const { applyThemeMode } = useSettingsContext();

  useEffect(() => {
    if (!forceDarkTheme) {
      return undefined;
    }
    applyThemeMode(ThemeMode.Dark);
    return () => {
      applyThemeMode();
    };
  }, [applyThemeMode, forceDarkTheme]);

  return (
    <div className="relative isolate z-3 grid min-h-dvh w-full grid-cols-2 bg-background-default text-text-primary">
      <main className="flex min-h-dvh min-w-0 flex-col items-center p-10">
        <div className="flex w-full max-w-[27.5rem] flex-1 flex-col">
          <Logo
            position={LogoPosition.Relative}
            className="!left-0 !top-0 !mt-0 !translate-x-0 self-start"
            logoClassName={{ container: 'h-logo' }}
          />
          <div className="mt-[max(2rem,calc(50dvh-19rem))] flex flex-col gap-6">
            <AuthScreenTitle
              title="Create your account"
              description="Sign up yourself, or hand the setup to your coding agent."
            />
            <AgentSignupModes entry={entry}>{children}</AgentSignupModes>
            {!entry.isAgentMode && (
              <SignupDisclaimer className="!text-left !text-text-tertiary typo-caption1" />
            )}
          </div>
        </div>
      </main>
      <aside className="sticky top-0 h-dvh min-w-0 p-10">
        <div className="size-full" style={boxStyle}>
          <div
            className="relative size-full overflow-hidden"
            style={{ ...boxInnerStyle, background: startupsPlazaSky }}
          >
            <StartupsCrewOnBase />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center px-10 pt-10"
              style={{ color: '#fff', paddingBottom: CREW_HEIGHT }}
            >
              {entry.isAgentMode ? (
                <AgentSteps />
              ) : (
                <p
                  className="max-w-[31rem] text-balance text-center font-bold tracking-tight"
                  style={headlineStyle}
                >
                  {headline}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
