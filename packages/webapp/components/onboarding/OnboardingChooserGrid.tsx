import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { GitHubIcon } from '@dailydotdev/shared/src/components/icons/GitHub';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons/Magic';
import { TerminalIcon } from '@dailydotdev/shared/src/components/icons/Terminal';
import { NewTabIcon } from '@dailydotdev/shared/src/components/icons/NewTab';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

const PARTICLES = [
  {
    px: '-6rem',
    py: '-3.5rem',
    dur: '3.0s',
    delay: '0s',
    color: 'bg-accent-cheese-default',
  },
  {
    px: '5.5rem',
    py: '-4rem',
    dur: '3.4s',
    delay: '0.5s',
    color: 'bg-accent-water-default',
  },
  {
    px: '-5rem',
    py: '3.5rem',
    dur: '3.2s',
    delay: '1.0s',
    color: 'bg-accent-cabbage-default',
  },
  {
    px: '6rem',
    py: '3rem',
    dur: '3.6s',
    delay: '1.5s',
    color: 'bg-accent-onion-default',
  },
  {
    px: '0.5rem',
    py: '-5rem',
    dur: '2.8s',
    delay: '0.7s',
    color: 'bg-accent-cheese-default',
  },
  {
    px: '-6.5rem',
    py: '0.5rem',
    dur: '3.1s',
    delay: '1.2s',
    color: 'bg-accent-water-default',
  },
];

const STEPS = [
  { text: 'We spot your stack from GitHub', icon: 'stack' },
  { text: 'AI matches your skills to topics', icon: 'ai' },
  { text: 'Your feed is ready in seconds', icon: 'feed' },
] as const;

type Props = {
  aiPrompt: string;
  onAiPromptChange: (value: string) => void;
  canStartAiFlow: boolean;
  onGithubClick: () => void;
  onAiSubmit: () => void;
};

export function OnboardingChooserGrid({
  aiPrompt,
  onAiPromptChange,
  canStartAiFlow,
  onGithubClick,
  onAiSubmit,
}: Props): ReactElement {
  return (
    <div className="relative z-1 grid gap-4 tablet:grid-cols-2 tablet:items-stretch tablet:gap-5">
      {/* ── Path A: GitHub ── */}
      <div className="onb-glass flex h-full min-h-[24rem] flex-1 flex-col items-center overflow-hidden rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out tablet:min-h-[26rem] tablet:self-stretch">
        {/* Animated orb */}
        <div
          className="relative -mx-6 -mt-6 mb-0 flex h-32 items-center justify-center"
          style={{ width: 'calc(100% + 3rem)' }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, var(--theme-accent-cabbage-default) 0%, transparent 65%)',
              opacity: 0.22,
            }}
          />
          <div className="ghub-orb-glow bg-accent-cabbage-default/15 pointer-events-none absolute h-32 w-52 rounded-full blur-3xl" />
          <svg
            className="ghub-ring pointer-events-none absolute"
            style={{ width: '11rem', height: '11rem' }}
            viewBox="0 0 176 176"
          >
            <circle
              cx="88"
              cy="88"
              r="84"
              fill="none"
              stroke="var(--theme-accent-cabbage-default)"
              strokeWidth="1.5"
              strokeDasharray="6 10"
              opacity="0.18"
            />
          </svg>
          <svg
            className="ghub-ring-reverse pointer-events-none absolute h-24 w-24"
            viewBox="0 0 96 96"
          >
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="var(--theme-accent-cabbage-default)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              opacity="0.35"
            />
          </svg>
          <svg
            className="onb-ring-slow pointer-events-none absolute h-16 w-16"
            viewBox="0 0 64 64"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="var(--theme-accent-cabbage-default)"
              strokeWidth="1"
              strokeDasharray="3 5"
              opacity="0.3"
            />
          </svg>
          {PARTICLES.map((p) => (
            <span
              key={`ghub-${p.delay}`}
              className={classNames(
                'ghub-particle pointer-events-none absolute h-2 w-2 rounded-full',
                p.color,
              )}
              style={
                {
                  '--px': p.px,
                  '--py': p.py,
                  '--dur': p.dur,
                  '--delay': p.delay,
                  animationDelay: p.delay,
                } as React.CSSProperties
              }
            />
          ))}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
            <GitHubIcon
              secondary
              className="h-[26px] w-[26px] text-text-primary"
            />
          </div>
        </div>

        <h4 className="mb-1.5 break-words text-center font-bold text-text-primary typo-body">
          One-click setup
        </h4>
        <p className="mb-5 text-center text-text-tertiary typo-footnote">
          Connect GitHub and let our AI do the rest.
        </p>

        <div className="mb-5 flex w-full flex-col items-center gap-3">
          {STEPS.map(({ text, icon }) => (
            <div
              key={text}
              className="flex w-full max-w-[15.5rem] items-center gap-2"
            >
              <span
                className={classNames(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  icon === 'stack' &&
                    'bg-accent-avocado-default/20 text-accent-avocado-default',
                  icon === 'ai' &&
                    'bg-accent-cheese-default/20 text-accent-cheese-default',
                  icon === 'feed' &&
                    'bg-accent-water-default/20 text-accent-water-default',
                )}
              >
                {icon === 'stack' && (
                  <TerminalIcon size={IconSize.Size16} secondary />
                )}
                {icon === 'ai' && (
                  <MagicIcon size={IconSize.Size16} secondary />
                )}
                {icon === 'feed' && (
                  <NewTabIcon size={IconSize.Size16} secondary />
                )}
              </span>
              <span className="text-left text-text-primary typo-footnote">
                {text}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-border-subtlest-tertiary/30 mb-5 h-px w-full" />

        <div className="relative mt-auto w-full pt-4">
          <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
          <button
            type="button"
            onClick={onGithubClick}
            className="onb-btn-shine focus-visible:ring-white/20 group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 bg-white px-5 py-3.5 font-bold text-black transition-all duration-300 typo-callout hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] focus-visible:outline-none focus-visible:ring-2"
          >
            <GitHubIcon secondary size={IconSize.XSmall} />
            Continue with GitHub
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="text-black/30 transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="mt-2.5 text-text-quaternary typo-caption2">
          Read-only access &middot; No special permissions
        </p>
      </div>

      {/* ── Path B: AI ── */}
      <div className="onb-glass flex h-full min-h-[24rem] flex-1 flex-col items-center overflow-hidden rounded-16 border border-white/[0.06] p-6 transition-all duration-700 ease-out tablet:min-h-[26rem] tablet:self-stretch">
        <div
          className="relative -mx-6 -mt-6 mb-0 flex h-32 items-center justify-center"
          style={{ width: 'calc(100% + 3rem)' }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, var(--theme-accent-onion-default) 0%, transparent 65%)',
              opacity: 0.22,
            }}
          />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
            <MagicIcon secondary size={IconSize.Small} className="text-white" />
          </div>
        </div>

        <h4 className="mb-1.5 break-words text-center font-bold text-text-primary typo-body">
          Tell our AI about yourself
        </h4>
        <p className="mb-5 text-center text-text-tertiary typo-footnote">
          Describe your stack and let AI build your feed.
        </p>

        <div className="onb-textarea-glow mb-3 w-full rounded-12 border border-white/[0.06] bg-white/[0.02] transition-all duration-300 focus-within:border-white/[0.18] focus-within:bg-white/[0.08] focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_12px_28px_rgba(0,0,0,0.3)] hover:border-white/[0.06] hover:bg-white/[0.02] hover:shadow-none">
          <textarea
            value={aiPrompt}
            onChange={(e) => onAiPromptChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || e.shiftKey) {
                return;
              }
              e.preventDefault();
              if (aiPrompt.trim()) {
                onAiSubmit();
              }
            }}
            rows={4}
            placeholder="I'm a frontend engineer working with React and TypeScript. Interested in system design, AI tooling..."
            className="min-h-[6.25rem] w-full resize-none bg-transparent px-3.5 pb-2 pt-3 text-text-primary transition-colors duration-200 typo-callout placeholder:text-text-quaternary focus:outline-none focus:placeholder:text-text-disabled"
          />
        </div>

        <div className="relative mt-auto w-full pt-4">
          <div className="onb-btn-glow pointer-events-none absolute -inset-2 rounded-16 bg-white/[0.04] blur-lg" />
          <button
            type="button"
            disabled={!canStartAiFlow}
            onClick={onAiSubmit}
            className={classNames(
              'focus-visible:ring-white/20 group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-14 px-5 py-3.5 font-bold transition-all duration-300 typo-callout focus-visible:outline-none focus-visible:ring-2',
              canStartAiFlow
                ? 'bg-white text-black hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)]'
                : 'cursor-not-allowed bg-white/[0.08] text-text-disabled',
            )}
          >
            <MagicIcon
              secondary
              size={IconSize.Size16}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
            Generate my feed with AI
          </button>
        </div>
        <p className="mt-2.5 text-text-quaternary typo-caption2">
          AI-powered &middot; instant personalization
        </p>
      </div>
    </div>
  );
}
