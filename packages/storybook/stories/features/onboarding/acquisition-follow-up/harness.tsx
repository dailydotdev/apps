import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { delay, graphql, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';

/**
 * Scaffolding shared by the "Acquisition follow-up" stories. Nothing here
 * ships: the step is the production component, and this only fakes the save
 * and shows what it sent.
 */

const SAVED_EVENT = 'acquisition-follow-up:saved';

/**
 * `AddUserAcquisitionChannel`, the step's only write. MSW runs the resolver in
 * the page, so it can tell the report below what was stored.
 */
export const saveHandler = ({
  latency = 400,
  fails = false,
}: { latency?: number | 'infinite'; fails?: boolean } = {}) =>
  graphql.mutation('AddUserAcquisitionChannel', async ({ variables }) => {
    await delay(latency);
    window.dispatchEvent(
      new CustomEvent(SAVED_EVENT, {
        detail: { stored: variables.acquisitionChannel, fails },
      }),
    );

    if (fails) {
      return HttpResponse.json({ errors: [{ message: 'Service down' }] });
    }

    return HttpResponse.json({
      data: { addUserAcquisitionChannel: { _: true } },
    });
  });

interface Saved {
  stored: string;
  fails: boolean;
}

/**
 * Every save in order and what the funnel received, shown once the step is
 * done: one save per step, with the answer or, on Skip, the plain channel.
 * Mid-flow screens show no report, so they look exactly like production.
 */
export const SaveReport = ({
  children,
}: {
  children: (handlers: {
    onTransition: (transition: unknown) => void;
    onRegisterStepToSkip: (type: unknown, shouldSkip: boolean) => void;
  }) => ReactNode;
}): ReactElement => {
  const [saves, setSaves] = useState<Saved[]>([]);
  const [transition, setTransition] = useState<unknown>();
  const [isSkippedByGuard, setIsSkippedByGuard] = useState(false);

  useEffect(() => {
    const onSaved = (event: Event) =>
      setSaves((list) => [...list, (event as CustomEvent<Saved>).detail]);
    window.addEventListener(SAVED_EVENT, onSaved);

    return () => window.removeEventListener(SAVED_EVENT, onSaved);
  }, []);

  const hasReport = !!transition || isSkippedByGuard;
  const hasFailed = saves.some(({ fails }) => fails);

  return (
    <div className="flex min-h-dvh flex-col">
      {hasReport && (
        <div
          className={classNames(
            'flex flex-col gap-1 px-6 py-3',
            hasFailed ? 'bg-overlay-float-ketchup' : 'bg-surface-float',
          )}
          data-testid="save-report"
        >
          {isSkippedByGuard && (
            <span className="font-bold text-text-primary typo-footnote">
              The step is skipped: this profile already has an answer.
            </span>
          )}
          {saves.length > 0 && (
            <span className="font-bold text-text-primary typo-footnote">
              {hasFailed
                ? 'A save failed (the step moves on regardless). It sent:'
                : 'Saved on the profile, in order:'}
            </span>
          )}
          {saves.map(({ stored }, index) => (
            <code
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="break-all text-text-secondary typo-footnote"
            >
              {index + 1}. acquisitionChannel: &quot;{stored}&quot;
            </code>
          ))}
          {!saves.length && !!transition && (
            <span className="font-bold text-text-primary typo-footnote">
              Nothing saved. The funnel moved on:
            </span>
          )}
          {!!transition && (
            <code className="break-all text-text-tertiary typo-caption1">
              funnel transition: {JSON.stringify(transition)}
            </code>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col">
        {children({
          onTransition: setTransition,
          onRegisterStepToSkip: (_, shouldSkip) =>
            setIsSkippedByGuard(shouldSkip),
        })}
      </div>
    </div>
  );
};

export const SEARCH_OPTION = 'Search engine';
export const AI_OPTION = 'AI assistant like ChatGPT';
export const SEARCH_HEADLINE = 'What did you search for?';
export const AI_HEADLINE = 'What did you ask the AI?';

// Picks an option on the list and continues, landing on its follow-up when
// the arm has one.
export const pickAndContinue = async (
  canvasElement: HTMLElement,
  option: string,
): Promise<void> => {
  const canvas = within(canvasElement);
  await userEvent.click(
    await canvas.findByRole('checkbox', { name: option }, { timeout: 10000 }),
  );
  await userEvent.click(
    await canvas.findByRole('button', { name: /Continue|Next/ }),
  );
};

export const typeInto = async (
  canvasElement: HTMLElement,
  name: string,
  answer: string,
): Promise<HTMLElement> => {
  const field = await within(canvasElement).findByRole(
    'textbox',
    { name },
    { timeout: 10000 },
  );
  await userEvent.click(field);
  await userEvent.type(field, answer, { delay: 40 });

  return field;
};

// 36 characters: the API's 50 minus the `search_engine:` prefix.
export const LIMIT_SEARCH = 'best app to keep up with dev news ok';
export const SAMPLE_SEARCH = 'daily dev news';
export const SAMPLE_PROMPT = 'best app for developer news';

/**
 * A story at a real viewport, scaled down to fit its column. Tailwind
 * breakpoints follow the viewport, so a narrow div would still get the
 * desktop layout.
 */
export const ViewportFrame = ({
  storyId,
  label,
  width,
  height,
  maxScale = 1,
}: {
  storyId: string;
  label: string;
  width: number;
  height: number;
  maxScale?: number;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  // Frames follow the toolbar theme the page itself was rendered with.
  const theme = document.documentElement.classList.contains('light')
    ? 'light'
    : 'dark';

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) =>
      setScale(Math.min(maxScale, entry.contentRect.width / width)),
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [maxScale, width]);

  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="flex items-baseline gap-2">
        <span className="font-bold text-text-primary typo-callout">
          {label}
        </span>
        <span className="text-text-tertiary typo-caption1">
          {width}×{height}
        </span>
      </figcaption>
      {/* Sized from its column, never from the frame, so a wide viewport
          can't push the grid wider than the page. */}
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
        style={{
          maxWidth: width * maxScale,
          aspectRatio: `${width} / ${height}`,
        }}
      >
        <iframe
          title={`${label}, ${width}×${height}`}
          src={`iframe.html?id=${storyId}&viewMode=story&globals=theme:${theme}`}
          loading="lazy"
          className="absolute left-0 top-0 origin-top-left"
          style={{ width, height, transform: `scale(${scale})` }}
        />
      </div>
    </figure>
  );
};

export const Page = ({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="min-h-screen bg-background-default px-4 py-8 text-text-primary tablet:px-10">
    <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-10">
      <header className="flex max-w-[48rem] flex-col gap-2">
        <p className="font-bold text-text-tertiary typo-footnote">{eyebrow}</p>
        <h1 className="font-bold typo-title1">{title}</h1>
        {intro && (
          <div className="text-text-secondary typo-callout">{intro}</div>
        )}
      </header>
      {children}
    </div>
  </div>
);

export const Section = ({
  title,
  note,
  children,
}: {
  title: string;
  note?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="font-bold typo-title3">{title}</h2>
      {note && <p className="text-text-tertiary typo-callout">{note}</p>}
    </div>
    {children}
  </section>
);

export const STORY_ROOT = 'features-onboarding-acquisition-follow-up';
export const flowStory = (name: string): string =>
  `${STORY_ROOT}-1-flow--${name}`;
