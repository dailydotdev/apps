import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

/**
 * A review page, not a component: every step of the signup onboarding, how a
 * user finishes it today, and whether its Continue button is a second tap
 * asking the user to confirm a choice they just made.
 *
 * The previews are the live step stories, so they stay in sync with the steps.
 */

type Verdict = 'drop' | 'consider' | 'keep' | 'done';

interface AuditStep {
  id: string;
  name: string;
  storyId?: string;
  isNew?: boolean;
  shownTo: string;
  verdict: Verdict;
  today: string[];
  suggested?: string[];
  why: string;
  watchOut?: string;
  engineering?: string;
}

const VERDICTS: Record<
  Verdict,
  { label: string; badge: string; description: string }
> = {
  drop: {
    label: 'Drop Continue',
    badge: 'border-accent-avocado-default text-accent-avocado-default',
    description: 'The option tap is the answer. Move on with it.',
  },
  consider: {
    label: 'Consider',
    badge: 'border-accent-cheese-default text-accent-cheese-default',
    description: 'Worth doing, with a trade-off to test first.',
  },
  keep: {
    label: 'Keep Continue',
    badge: 'border-border-subtlest-secondary text-text-secondary',
    description: 'No single tap means done, so Continue earns its place.',
  },
  done: {
    label: 'Already one tap',
    badge: 'border-accent-blueCheese-default text-accent-blueCheese-default',
    description: 'The main button is the transition. Nothing to trim.',
  },
};

// The order a user meets them with every step enabled. Which steps actually
// run is configured per funnel in Freyja, not in this repo.
const STEPS: AuditStep[] = [
  {
    id: 'signup',
    name: 'Sign up',
    shownTo: 'Everyone',
    verdict: 'done',
    today: ['Tap Google or GitHub'],
    why: 'The provider button is the action. There is nothing between the tap and the next screen.',
  },
  {
    id: 'verify-email',
    name: 'Verify email',
    shownTo: 'Email signups only',
    verdict: 'done',
    today: ['Type the 6-digit code'],
    why: 'The code submits itself on the sixth digit, and iOS autofill fills it in one tap. This is the pattern the rest of the funnel should follow.',
  },
  {
    id: 'account-details',
    name: 'Account details',
    storyId: 'components-onboarding-signup-funnel-steps--account-details',
    shownTo: 'Everyone: the email form, or the social form after Google or GitHub',
    verdict: 'keep',
    today: ['Check the prefilled fields', 'Tap Sign up'],
    why: 'A form with several fields needs an explicit submit, and it still asks for the experience level, so there is no single tap to finish on.',
  },
  {
    id: 'hear-about-us',
    name: 'How did you hear about us',
    storyId: 'components-onboarding-identity-steps--hear-about-us',
    isNew: true,
    shownTo: 'Everyone who has not answered it before',
    verdict: 'keep',
    today: ['Tap a channel', 'Tap Continue'],
    why: 'Decided: keep Continue, so the two new questions behave the same way. Tapping an option selects it, and Continue moves on.',
  },
  {
    id: 'who-are-you',
    name: 'Who are you',
    storyId: 'components-onboarding-identity-steps--who-are-you',
    isNew: true,
    shownTo: 'Everyone without a job title on file',
    verdict: 'keep',
    today: ['Tap a role', 'Tap Continue'],
    why: 'Decided: keep Continue, matching How did you hear about us. The role is saved as the job title, except Something else, which saves nothing.',
  },
  {
    id: 'pick-tags',
    name: 'Pick tags',
    storyId: 'components-onboarding-signup-funnel-steps--pick-tags',
    shownTo: 'Everyone',
    verdict: 'keep',
    today: ['Tap 5 or more tags', 'Tap Continue'],
    why: 'Multi-select with a minimum. No single tap means done, so Continue is the only honest end of the step.',
  },
  {
    id: 'content-types',
    name: 'Content types',
    storyId: 'components-onboarding-signup-funnel-steps--content-types',
    shownTo: 'Everyone',
    verdict: 'keep',
    today: ['Review the defaults', 'Tap Continue'],
    why: 'Everything starts selected, so most people only tap Continue. It is already one tap for them, and advancing on a toggle would cut off anyone changing more than one.',
  },
  {
    id: 'reading-reminder',
    name: 'Reading reminder',
    storyId: 'components-onboarding-signup-funnel-steps--reading-reminder',
    shownTo: 'Mobile, and desktop under onboarding_reminder_desktop',
    verdict: 'consider',
    today: ['Tap a time', 'Tap Submit'],
    suggested: ['Tap a time'],
    why: 'Three of the four options are complete answers. Tapping 12:00 or 17:00 could schedule and move on. Custom still needs a confirm after the hour picker.',
    watchOut:
      'Submit also asks for push permission, so the browser prompt would open right on the option tap. Browsers allow it (it is a user gesture), but it is abrupt; test it. 09:00 is preselected today, so it would need to start unselected or the default path has nothing to tap.',
    engineering:
      'useReadingReminder: submit from the option click for preset values, and show Submit only while Custom is selected.',
  },
  {
    id: 'install-pwa',
    name: 'Install PWA',
    storyId: 'components-onboarding-signup-funnel-steps--install-pwa',
    shownTo: 'iOS Safari only',
    verdict: 'keep',
    today: ['Follow the share-sheet steps', 'Tap Continue'],
    why: 'The real action happens in Safari’s share sheet, outside the page. Continue is how the user says they are back; nothing on the page can stand in for it.',
  },
  {
    id: 'upload-cv',
    name: 'Upload CV',
    storyId: 'components-onboarding-signup-funnel-steps--upload-cv',
    shownTo: 'Funnels that include it',
    verdict: 'drop',
    today: ['Upload a file', 'Tap Continue'],
    suggested: ['Upload a file'],
    why: 'Continue stays disabled until the upload succeeds, so the only thing it can ever do is confirm a success the page just showed.',
    watchOut:
      'Hold the success state for about a second so the user sees it worked. Skip stays for people without a CV.',
    engineering:
      'FunnelUploadCv: call handleComplete once isSuccess turns true, after the success state has shown. Keep the wrapper for its Skip.',
  },
  {
    id: 'plus',
    name: 'Plus',
    storyId: 'components-onboarding-signup-funnel-steps--plus-cards',
    shownTo: 'Users without Plus',
    verdict: 'done',
    today: ['Tap Free or Plus'],
    why: 'Each card’s button is both the choice and the transition. There is no separate Continue.',
  },
  {
    id: 'browser-extension',
    name: 'Browser extension',
    storyId: 'components-onboarding-signup-funnel-steps--browser-extension',
    shownTo: 'Desktop browsers without the extension',
    verdict: 'done',
    today: ['Tap Add to Chrome'],
    why: 'The install button opens the store and advances the funnel in the same tap.',
  },
];

const tapsSaved = (step: AuditStep): number =>
  step.suggested ? step.today.length - step.suggested.length : 0;

const useToolbarTheme = (): 'dark' | 'light' => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const read = () =>
      setTheme(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      );
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
};

const PREVIEW = { width: 390, height: 844, scale: 0.42 };

const Preview = ({
  storyId,
  isMounted,
  theme,
}: {
  storyId: string;
  isMounted: boolean;
  theme: 'dark' | 'light';
}): ReactElement => {
  const box = {
    width: PREVIEW.width * PREVIEW.scale,
    height: PREVIEW.height * PREVIEW.scale,
  };

  if (!isMounted) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-16 border border-dashed border-border-subtlest-tertiary p-4 text-center text-text-quaternary typo-caption1"
        style={box}
      >
        Loading preview
      </div>
    );
  }

  return (
    <div
      className="shrink-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary"
      style={box}
    >
      <iframe
        src={`/iframe.html?id=${storyId}&viewMode=story&globals=theme:${theme}`}
        style={{
          width: PREVIEW.width,
          height: PREVIEW.height,
          border: 0,
          transform: `scale(${PREVIEW.scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
        tabIndex={-1}
        title={storyId}
      />
    </div>
  );
};

const TapPath = ({
  label,
  taps,
  removed = [],
}: {
  label: string;
  taps: string[];
  removed?: string[];
}): ReactElement => (
  <div className="flex flex-wrap items-center gap-2">
    <span
      className="shrink-0 text-text-quaternary typo-caption1"
      style={{ width: '4.5rem' }}
    >
      {label}
    </span>
    {taps.map((tap, index) => {
      const isRemoved = removed.includes(tap);

      return (
        <React.Fragment key={tap}>
          {index > 0 && (
            <span aria-hidden className="text-text-quaternary typo-caption1">
              then
            </span>
          )}
          <span
            className={`rounded-8 border px-2 py-1 typo-footnote ${
              isRemoved
                ? 'border-dashed border-border-subtlest-tertiary text-text-quaternary line-through'
                : 'border-border-subtlest-secondary text-text-primary'
            }`}
          >
            {tap}
          </span>
        </React.Fragment>
      );
    })}
    <span className="tabular-nums text-text-tertiary typo-caption1">
      {taps.length - removed.length}{' '}
      {taps.length - removed.length === 1 ? 'tap' : 'taps'}
    </span>
  </div>
);

const StepCard = ({
  step,
  index,
  isMounted,
  theme,
}: {
  step: AuditStep;
  index: number;
  isMounted: boolean;
  theme: 'dark' | 'light';
}): ReactElement => {
  const verdict = VERDICTS[step.verdict];
  const removed = step.suggested
    ? step.today.filter((tap) => !step.suggested?.includes(tap))
    : [];

  return (
    <article className="flex flex-wrap gap-6 rounded-24 border border-border-subtlest-tertiary p-5">
      {step.storyId && (
        <Preview isMounted={isMounted} storyId={step.storyId} theme={theme} />
      )}
      <div
        className="flex min-w-0 flex-1 flex-col gap-4"
        style={{ minWidth: '18rem' }}
      >
        <header className="flex flex-wrap items-center gap-2">
          <span className="tabular-nums text-text-quaternary typo-callout">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h2 className="font-bold typo-title3">{step.name}</h2>
          {step.isNew && (
            <span className="rounded-8 border border-border-subtlest-secondary px-2 py-0.5 text-text-tertiary typo-caption1">
              New step
            </span>
          )}
          <span
            className={`ml-auto rounded-8 border px-2 py-1 font-bold typo-caption1 ${verdict.badge}`}
          >
            {verdict.label}
          </span>
        </header>
        <p className="-mt-2 text-text-tertiary typo-footnote">
          Shown to: {step.shownTo}
        </p>

        <div className="flex flex-col gap-2">
          <TapPath label="Today" taps={step.today} />
          {step.suggested && (
            <TapPath label="Suggested" removed={removed} taps={step.today} />
          )}
        </div>

        <p className="text-text-secondary typo-callout">{step.why}</p>

        {step.watchOut && (
          <p className="text-text-secondary typo-footnote">
            <span className="font-bold text-text-primary">Watch out: </span>
            {step.watchOut}
          </p>
        )}

        {step.engineering && (
          <p className="rounded-12 bg-surface-float p-3 text-text-tertiary typo-footnote">
            <span className="font-bold text-text-secondary">
              For engineering:{' '}
            </span>
            {step.engineering}
          </p>
        )}
      </div>
    </article>
  );
};

const FILTERS: Array<{ value: Verdict | 'all'; label: string }> = [
  { value: 'all', label: 'All steps' },
  { value: 'drop', label: VERDICTS.drop.label },
  { value: 'consider', label: VERDICTS.consider.label },
  { value: 'keep', label: VERDICTS.keep.label },
  { value: 'done', label: VERDICTS.done.label },
];

const ClickAudit = (): ReactElement => {
  const theme = useToolbarTheme();
  const [filter, setFilter] = useState<Verdict | 'all'>('all');
  const visible = STEPS.filter(
    (step) => filter === 'all' || step.verdict === filter,
  );
  const previewCount = STEPS.filter(({ storyId }) => storyId).length;
  // One preview at a time: a dozen iframes booting together make a cold Vite
  // server re-run dep optimization and every frame dies mid-import.
  const [mounted, setMounted] = useState(1);

  useEffect(() => {
    if (mounted >= previewCount) {
      return undefined;
    }
    const timeout = setTimeout(() => setMounted((count) => count + 1), 450);

    return () => clearTimeout(timeout);
  }, [mounted, previewCount]);

  const dropCount = STEPS.filter(({ verdict }) => verdict === 'drop').length;
  const upToSaved = STEPS.filter(({ verdict }) =>
    ['drop', 'consider'].includes(verdict),
  ).reduce((sum, step) => sum + tapsSaved(step), 0);
  const alreadyDone = STEPS.filter(({ verdict }) => verdict === 'done').length;
  const previewOrder = STEPS.filter(({ storyId }) => storyId).map(
    ({ id }) => id,
  );

  const stats = [
    { value: dropCount, label: 'steps can drop Continue' },
    { value: upToSaved, label: 'taps saved at most, per signup' },
    { value: alreadyDone, label: 'steps are already one tap' },
  ];

  return (
    <div className="flex min-h-dvh flex-col gap-8 bg-background-default p-6 laptop:p-10">
      <header className="flex flex-col gap-2" style={{ maxWidth: '48rem' }}>
        <p className="font-bold uppercase text-text-quaternary typo-caption1">
          Onboarding review
        </p>
        <h1 className="font-bold typo-title1">Tap the answer, not Continue</h1>
        <p className="text-text-secondary typo-body">
          When a step asks one question with fixed answers, tapping an answer
          already says everything. A Continue button after it is a second tap
          that confirms the first. Below is every onboarding step, how it ends
          today, and where the Continue button can go.
        </p>
      </header>

      <section className="flex flex-wrap gap-3">
        {stats.map(({ value, label }) => (
          <div
            className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary p-4"
            key={label}
            style={{ minWidth: '11rem' }}
          >
            <span className="font-bold tabular-nums typo-title1">{value}</span>
            <span className="text-text-tertiary typo-footnote">{label}</span>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ value, label }) => {
            const count =
              value === 'all'
                ? STEPS.length
                : STEPS.filter(({ verdict }) => verdict === value).length;

            return (
              <Button
                key={value}
                onClick={() => setFilter(value)}
                size={ButtonSize.Small}
                type="button"
                variant={
                  filter === value ? ButtonVariant.Primary : ButtonVariant.Float
                }
              >
                {label} <span className="ml-1 tabular-nums">{count}</span>
              </Button>
            );
          })}
        </div>
        {filter !== 'all' && (
          <p className="text-text-tertiary typo-footnote">
            {VERDICTS[filter].description}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4" style={{ maxWidth: '64rem' }}>
        {visible.map((step) => (
          <StepCard
            index={STEPS.indexOf(step)}
            isMounted={previewOrder.indexOf(step.id) < mounted}
            key={step.id}
            step={step}
            theme={theme}
          />
        ))}
      </section>

      <footer
        className="text-text-quaternary typo-footnote"
        style={{ maxWidth: '48rem' }}
      >
        Tap counts follow the most common path through each step. Which steps
        run, and in what order, is configured per funnel in Freyja, so a given
        signup meets a subset of these. Previews are the live step stories and
        are not interactive here; open a step&apos;s own story to click through
        it.
      </footer>
    </div>
  );
};

const meta: Meta = {
  title: 'Components/Onboarding/Click audit',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const ContinueButtonAudit: StoryObj = {
  name: '★ Where Continue can go',
  render: () => <ClickAudit />,
};
