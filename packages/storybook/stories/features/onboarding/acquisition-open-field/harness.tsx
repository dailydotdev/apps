import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { delay, graphql, HttpResponse } from 'msw';
import { userEvent, within } from 'storybook/test';

/**
 * Scaffolding shared by the "Acquisition open field" stories. Nothing here
 * ships: the step is the production component, and this only fakes the save
 * and shows what it sent.
 */

const SAVED_EVENT = 'acquisition-open-field:saved';

/**
 * `AddUserAcquisitionChannel`, the one write both surfaces make. MSW runs the
 * resolver in the page, so it can tell the report below what was stored.
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
 * What reached the profile and what the funnel received. A finished step
 * renders nothing new, so without it the end states would look broken.
 */
export const SaveReport = ({
  children,
}: {
  children: (onTransition: (transition: unknown) => void) => ReactNode;
}): ReactElement => {
  const [saved, setSaved] = useState<Saved>();
  const [transition, setTransition] = useState<unknown>();

  useEffect(() => {
    const onSaved = (event: Event) =>
      setSaved((event as CustomEvent<Saved>).detail);
    window.addEventListener(SAVED_EVENT, onSaved);

    return () => window.removeEventListener(SAVED_EVENT, onSaved);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      {!!saved && (
        <div
          className={classNames(
            'flex flex-col gap-1 px-6 py-3',
            saved.fails ? 'bg-overlay-float-ketchup' : 'bg-surface-float',
          )}
          data-testid="save-report"
        >
          <span className="font-bold text-text-primary typo-footnote">
            {saved.fails
              ? 'The save failed (the step moves on regardless). It sent:'
              : 'Saved on the profile as:'}
          </span>
          <code className="break-all text-text-secondary typo-footnote">
            acquisitionChannel: &quot;{saved.stored}&quot;
          </code>
          {!!transition && (
            <code className="break-all text-text-tertiary typo-caption1">
              funnel transition: {JSON.stringify(transition)}
            </code>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col">{children(setTransition)}</div>
    </div>
  );
};

export const typeAnswer = async (
  canvasElement: HTMLElement,
  answer: string,
): Promise<HTMLElement> => {
  const canvas = within(canvasElement);
  const field = await canvas.findByRole(
    'textbox',
    { name: 'How did you hear about us?' },
    { timeout: 10000 },
  );
  await userEvent.click(field);
  await userEvent.type(field, answer, { delay: 40 });

  return field;
};

// 44 characters: the API's 50 minus the `other:` prefix.
export const LIMIT_ANSWER = 'A coworker shared a daily.dev post on Slack.';
export const SAMPLE_ANSWER = 'A friend at work';

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

export const STORY_ROOT = 'features-onboarding-acquisition-open-field';
export const stepStory = (name: string): string =>
  `${STORY_ROOT}-1-onboarding-step--${name}`;
