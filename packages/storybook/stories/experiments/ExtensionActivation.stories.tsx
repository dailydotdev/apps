import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import classNames from 'classnames';
import HijackingLoginStrip from 'extension/src/newtab/HijackingLoginStrip';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { OnboardingHeader } from '@dailydotdev/shared/src/components/onboarding/OnboardingHeader';
import { ExtensionShowcase } from '@dailydotdev/shared/src/components/onboarding/ExtensionShowcase/ExtensionShowcase';
import { NewTabActivationPrimer } from '@dailydotdev/shared/src/features/onboarding/components/NewTabActivationPrimer';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { cloudinaryOnboardingActivationDemo } from '@dailydotdev/shared/src/lib/image';
import { DesktopFrame, Labeled, Page, Section } from '../onboarding-fixes/kit';
import {
  mockOnboardingRouter,
  OnboardingHero,
  Providers,
} from '../onboarding-fixes/harness';
import { getBootMock } from '../../mock/boot';
import { featuresFor, variants } from './extensionActivation/carouselCopy';
import type { Idea } from './extensionActivation/ideas';
import { notWorthIt, stages } from './extensionActivation/ideas';
import {
  Benefit,
  ChromePrompt,
  FeedSkeleton,
  PrimerCta,
  PrimerShell,
  PromptOverlay,
} from './extensionActivation/primerParts';

const ID = 'experiments-extension-activation';

const Shell = ({ children }: { children: ReactNode }): ReactElement => (
  <Providers isAuthenticating={false}>{children}</Providers>
);

const Headline = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    tag={TypographyTag.H1}
    type={TypographyType.LargeTitle}
    color={TypographyColor.Primary}
    bold
    className="text-balance text-center"
  >
    {children}
  </Typography>
);

const Sub = ({ children }: { children: ReactNode }): ReactElement => (
  <Typography
    tag={TypographyTag.P}
    type={TypographyType.Title3}
    color={TypographyColor.Secondary}
    className="max-w-[36rem] text-pretty text-center"
  >
    {children}
  </Typography>
);

const Choice = ({
  label,
  body,
  tone,
}: {
  label: string;
  body: string;
  tone: 'keep' | 'back';
}): ReactElement => (
  <div className="min-w-0 flex-1 rounded-16 border border-border-subtlest-tertiary p-3 text-left">
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Callout}
      color={
        tone === 'keep' ? TypographyColor.Primary : TypographyColor.Secondary
      }
      bold
    >
      {label}
    </Typography>
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="text-pretty"
    >
      {body}
    </Typography>
  </div>
);

const ClearStakesPage = (): ReactElement => (
  <PrimerShell>
    <div className="flex w-full max-w-[36rem] flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-2">
        <Headline>One question from Chrome, then you&apos;re set</Headline>
        <Sub>Chrome checks before an extension changes your new tab.</Sub>
      </div>
      <ChromePrompt coach />
      <div className="flex w-full gap-3">
        <Choice
          tone="keep"
          label="Keep it"
          body="Your dev feed on every new tab. Pause or remove it anytime."
        />
        <Choice
          tone="back"
          label="Change it back"
          body="Turns the daily.dev extension off."
        />
      </div>
      <PrimerCta label="Show me my new tab" note="Takes 2 seconds." />
    </div>
  </PrimerShell>
);

const ValueAndCoachPage = (): ReactElement => (
  <PrimerShell>
    <div className="grid w-full max-w-[60rem] grid-cols-1 items-center gap-10 laptop:grid-cols-2">
      <div className="flex flex-col gap-5">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          color={TypographyColor.Primary}
          bold
          className="text-balance"
        >
          Every new tab, now worth opening
        </Typography>
        <ul className="flex flex-col gap-3">
          <Benefit
            title="What developers are reading today"
            body="One ranked feed, picked for you."
          />
          <Benefit
            title="Your go-to sites stay close"
            body="Allow access once and your most-visited sites appear on your new tab."
          />
          <Benefit
            title="Pause it anytime"
            body="One click turns the new tab off for as long as you like."
          />
        </ul>
        <div className="flex">
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.XLarge}
          >
            Show me my new tab
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-6">
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="text-center"
        >
          Next, Chrome asks one question. Choose Keep it.
        </Typography>
        <ChromePrompt coach />
      </div>
    </div>
  </PrimerShell>
);

const CarouselFirstPage = (): ReactElement => {
  const features = useMemo(() => featuresFor(variants.reassure), []);

  return (
    <PrimerShell className="!justify-start !py-5">
      <div className="flex w-full max-w-[52rem] flex-col items-center gap-3">
        <Headline>Here&apos;s what you just added</Headline>
        <ExtensionShowcase
          features={features}
          defaultFeatureId="newtab"
          stageClassName="mx-auto max-w-[clamp(26rem,calc((100dvh-24rem)*2.04),44rem)]"
        />
        <PrimerCta
          label="Show me my new tab"
          note="Chrome will ask one question next. Choose Keep it."
        />
      </div>
    </PrimerShell>
  );
};

const FoldFixPage = (): ReactElement => (
  <PrimerShell>
    <div className="flex w-full max-w-[48rem] flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <Headline>Welcome! Let&apos;s activate your new tab.</Headline>
        <Sub>Tap “Keep it” on the Chrome popup.</Sub>
      </div>
      <video
        src={cloudinaryOnboardingActivationDemo}
        className="aspect-[1748/1080] w-full rounded-16 border border-border-subtlest-tertiary bg-background-subtle shadow-2"
        style={{ maxHeight: 'calc(100dvh - 19rem)', width: 'auto' }}
        muted
        autoPlay
        loop
        playsInline
        disablePictureInPicture
        aria-label="Rehearsal of Chrome's confirmation bubble and the Keep it click"
      />
      <PrimerCta
        label="Show me my new tab"
        note="Takes 2 seconds. Reversible anytime."
      />
    </div>
  </PrimerShell>
);

const FeedBehind = (): ReactElement => (
  <div className="p-6">
    <FeedSkeleton />
  </div>
);

const CoachLine = (): ReactElement => (
  <div
    className="max-w-[28rem] rounded-16 px-4 py-3 text-center"
    style={{ backgroundColor: '#0e1217', color: '#ffffff' }}
  >
    <p className="font-bold typo-callout">This is your new tab now</p>
    <p className="text-pretty typo-footnote">
      Press Keep it and your dev feed opens on every new tab. Pause it anytime.
    </p>
  </div>
);

const NewTabWithStrip = (): ReactElement => (
  <div className="min-h-dvh bg-background-default p-6">
    <div className="mx-auto flex w-full max-w-[60rem] flex-col gap-4">
      <HijackingLoginStrip />
      <FeedSkeleton />
    </div>
  </div>
);

const FlowStep = ({
  title,
  body,
  tone = 'neutral',
}: {
  title: string;
  body?: string;
  tone?: 'neutral' | 'bad' | 'good';
}): ReactElement => (
  <div
    className={classNames(
      'rounded-12 border p-3',
      tone === 'neutral' && 'border-border-subtlest-tertiary',
      tone === 'bad' && 'border-accent-ketchup-default',
      tone === 'good' && 'border-accent-avocado-default',
    )}
  >
    <p className="font-bold typo-callout">{title}</p>
    {body && <p className="text-text-tertiary typo-footnote">{body}</p>}
  </div>
);

const Flow = ({
  label,
  tone,
  primer,
  newTab,
}: {
  label: string;
  tone: 'before' | 'after';
  primer: ReactNode;
  newTab: ReactNode;
}): ReactElement => (
  <Labeled label={label} tone={tone}>
    <div className="grid grid-cols-2 gap-3">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="font-bold text-text-tertiary typo-footnote">
          The /activate tab
        </p>
        {primer}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="font-bold text-text-tertiary typo-footnote">
          The new tab
        </p>
        {newTab}
      </div>
    </div>
  </Labeled>
);

const WordsCard = ({
  who,
  headline,
  sub,
}: {
  who: string;
  headline: string;
  sub: string;
}): ReactElement => (
  <Labeled label={who}>
    <div className="flex h-full flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary p-5 text-center">
      <p className="text-balance font-bold typo-title3">{headline}</p>
      <p className="text-pretty text-text-secondary typo-callout">{sub}</p>
    </div>
  </Labeled>
);

const dropRows = [
  ['Clicked "Open new tab" on /activate', '30.0%'],
  ['Opened 10+ new tabs in 48 hours (our stand-in for kept)', '41.7%'],
  ['Opened 0–3 new tabs in 48 hours', '41.3%'],
  ['Signed up within 7 days', '21.9%'],
  ['Still using the extension in week 2', '35.4%'],
  ['Still using the extension in week 5', '27.9%'],
];

const retentionRows = [
  ['0', '20.8%', '13.1%'],
  ['1–3', '20.5%', '10.5%'],
  ['4–9', '17.0%', '28.0%'],
  ['10+', '41.7%', '61.2%'],
];

const SimpleTable = ({
  head,
  rows,
}: {
  head: string[];
  rows: string[][];
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="font-bold text-text-tertiary typo-footnote">
          {head.map((cell) => (
            <th key={cell} className="p-3">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[0]}>
            {row.map((cell) => (
              <td
                key={cell}
                className="border-t border-border-subtlest-tertiary p-3 tabular-nums typo-callout"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Fact = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement => (
  <div className="flex flex-col">
    <dt className="font-bold text-text-tertiary typo-caption1">{label}</dt>
    <dd className="text-pretty text-text-secondary typo-footnote">{value}</dd>
  </div>
);

const IdeaCard = ({ idea }: { idea: Idea }): ReactElement => (
  <article
    className={classNames(
      'flex flex-col gap-3 rounded-16 border p-4',
      idea.isPick
        ? 'border-accent-cabbage-default'
        : 'border-border-subtlest-tertiary',
    )}
  >
    <div className="flex items-start gap-2">
      <span className="flex size-6 items-center justify-center rounded-max bg-surface-float font-bold tabular-nums typo-caption1">
        {idea.id}
      </span>
      <h3 className="min-w-0 flex-1 text-balance font-bold typo-body">
        {idea.title}
      </h3>
      {idea.isPick && (
        <span className="rounded-8 bg-accent-cabbage-default px-2 py-0.5 font-bold text-surface-invert typo-caption1">
          My pick
        </span>
      )}
    </div>
    <p className="text-pretty typo-callout">{idea.what}</p>
    <p className="text-pretty text-text-tertiary typo-callout">{idea.why}</p>
    <dl className="mt-auto flex flex-col gap-2">
      <Fact label="Measure" value={idea.metric} />
      <Fact label="Effort" value={idea.effort} />
      <Fact label="Risk" value={idea.risk} />
    </dl>
    {idea.story && (
      <a
        className="font-bold text-text-link typo-callout"
        href={`?path=/story/${ID}--${idea.story}`}
        target="_top"
      >
        See it →
      </a>
    )}
  </article>
);

const meta: Meta = {
  title: 'Experiments/Extension activation',
  parameters: { layout: 'fullscreen', themes: { themeOverride: 'dark' } },
  // A dark boot theme, or the funnel steps invert back to light.
  beforeEach: () => {
    mockOnboardingRouter();
    const boot = getBootMock();
    getBootMock.mockReturnValue({
      ...boot,
      settings: { ...boot.settings, theme: 'darcula' },
    });
  },
};

export default meta;

export const Overview: StoryObj = {
  name: 'Read me: every idea',
  render: () => (
    <Page
      eyebrow="Extension retention · 22 ideas"
      title="Get new store installers to keep the new tab"
      intro="The biggest gap we can reach is the moment Chrome asks whether to keep daily.dev. Pressing Change it back turns the whole extension off, and today nothing explains that choice. Only the June primer test has actually tested this moment. Everything else here is an idea, and the numbers are associations, not proof."
    >
      <Section
        title="Where new store installers drop"
        note="9,067 new installers with no account who first saw /activate in September 2026, spam filter off."
      >
        <SimpleTable head={['Step', 'Share']} rows={dropRows} />
      </Section>
      <Section
        title="Why the first two days matter"
        note="10+ new tabs is a stand-in, because no event records Keep it or Change it back."
      >
        <SimpleTable
          head={['New tabs in 48h', 'Share of installers', 'Active in week 2']}
          rows={retentionRows}
        />
      </Section>
      <Section
        title="What I would do, in order"
        note="Rough size: 250–450 extra people active in week 2 each month for the first two tests combined, against about 50 for the carousel at the end of onboarding. It could also be close to zero, and it rests on one small test in June."
      >
        <ol className="flex list-decimal flex-col gap-2 pl-5 typo-callout">
          <li>
            <strong>Now:</strong> test Clear stakes (1) with the fold fix (4)
            against today. A 2-day read, about 2–3 weeks in all.
          </li>
          <li>
            <strong>Alongside it:</strong> add the still-enabled signal (20) and
            read the uninstall reasons (18), so later results can be trusted.
          </li>
          <li>
            <strong>Next:</strong> check in real Chrome that Coach behind the
            prompt (6) is possible, then test it.
          </li>
          <li>
            <strong>Then:</strong> test Show the feed, not a signup page (7),
            with signups as the guardrail.
          </li>
          <li>
            <strong>After those:</strong> run the first-week analysis (14) and
            choose from the later stages using what it shows.
          </li>
        </ol>
      </Section>
      {stages.map((stage) => (
        <Section key={stage.title} title={stage.title} note={stage.note}>
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
            {stage.ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </Section>
      ))}
      <Section title="What I would not do">
        <ul className="flex flex-col gap-3">
          {notWorthIt.map(({ title, why }) => (
            <li key={title} className="typo-callout">
              <strong>{title}.</strong>{' '}
              <span className="text-text-tertiary">{why}</span>
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  ),
};

export const ActivateLayouts: StoryObj = {
  name: '/activate: all layouts',
  render: () => (
    <Page
      eyebrow="Ideas 1–4"
      title="Every /activate layout at 1280×720"
      intro="All at laptop size, the screen where today's button sits at the fold. Today's frame is the real component. The carousel is the real one too, with new copy."
    >
      <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
        <Labeled label="Today" tone="before">
          <DesktopFrame
            storyId={`${ID}--today`}
            title="Today"
            height={720}
          />
        </Labeled>
        <Labeled label="1. Clear stakes (my pick)" tone="after">
          <DesktopFrame
            storyId={`${ID}--clear-stakes`}
            title="Clear stakes"
            height={720}
          />
        </Labeled>
        <Labeled label="2. Value and coach" tone="after">
          <DesktopFrame
            storyId={`${ID}--value-and-coach`}
            title="Value and coach"
            height={720}
          />
        </Labeled>
        <Labeled label="3. Carousel first" tone="after">
          <DesktopFrame
            storyId={`${ID}--carousel-first`}
            title="Carousel first"
            height={720}
          />
        </Labeled>
        <Labeled label="4. Fold fix" tone="after">
          <DesktopFrame
            storyId={`${ID}--fold-fix`}
            title="Fold fix"
            height={720}
          />
        </Labeled>
      </div>
    </Page>
  ),
};

export const Today: StoryObj = {
  name: 'Today: /activate',
  render: () => (
    <Shell>
      <div className="flex min-h-dvh w-full flex-col items-center bg-background-default">
        <OnboardingHeader />
        <NewTabActivationPrimer onComplete={fn()} />
      </div>
    </Shell>
  ),
};

export const ClearStakes: StoryObj = {
  name: '1. Clear stakes',
  render: () => (
    <Shell>
      <ClearStakesPage />
    </Shell>
  ),
};

export const ValueAndCoach: StoryObj = {
  name: '2. Value and coach',
  render: () => (
    <Shell>
      <ValueAndCoachPage />
    </Shell>
  ),
};

export const CarouselFirst: StoryObj = {
  name: '3. Carousel first',
  render: () => (
    <Shell>
      <CarouselFirstPage />
    </Shell>
  ),
};

export const FoldFix: StoryObj = {
  name: '4. Fold fix',
  render: () => (
    <Shell>
      <FoldFixPage />
    </Shell>
  ),
};

export const WordsByAudience: StoryObj = {
  name: '5. Right words for each person',
  render: () => (
    <Page
      eyebrow="Idea 5"
      title="The same page, greeting the right person"
      intro="Only the headline and line under it change. Check each browser's real prompt before writing its button name; I have only seen Chrome's."
    >
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 laptop:grid-cols-4">
        <WordsCard
          who="Today: everyone"
          headline="Welcome! Let's activate your new tab."
          sub="Tap “Keep it” on the Chrome popup."
        />
        <WordsCard
          who="Returning member"
          headline="Welcome back. Let's turn your new tab on."
          sub="Tap “Keep it” on the Chrome popup."
        />
        <WordsCard
          who="Mid-signup"
          headline="One last step: turn on your new tab"
          sub="Tap “Keep it” on the Chrome popup, then finish signing up."
        />
        <WordsCard
          who="Edge and Opera"
          headline="Welcome! Let's activate your new tab."
          sub="Your browser will ask to confirm. Choose to keep the change."
        />
      </div>
    </Page>
  ),
};

export const PromptToday: StoryObj = {
  name: '6. Behind the prompt: today (signed out)',
  render: () => (
    <Shell>
      <PromptOverlay>
        <OnboardingHero />
      </PromptOverlay>
    </Shell>
  ),
};

export const PromptIdea: StoryObj = {
  name: '6. Behind the prompt: idea',
  render: () => (
    <Shell>
      <PromptOverlay coach={<CoachLine />}>
        <FeedBehind />
      </PromptOverlay>
    </Shell>
  ),
};

export const BehindThePrompt: StoryObj = {
  name: '6. Coach behind the prompt',
  render: () => (
    <Page
      eyebrow="Idea 6 (my pick)"
      title="Give people a reason while Chrome is asking"
      intro="Signed-out clickers are sent to the signup page by the new tab, so that is probably what they see behind the prompt. I worked this out from the code and have not seen it live. The idea keeps the feed there, with one line of help. It would also reach non-clickers on their first new tab, the only idea that does at the moment they choose. It needs a check in real Chrome first."
    >
      <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
        <Labeled label="Today, signed out" tone="before">
          <DesktopFrame storyId={`${ID}--prompt-today`} title="Today" />
        </Labeled>
        <Labeled label="Idea" tone="after">
          <DesktopFrame storyId={`${ID}--prompt-idea`} title="Idea" />
        </Labeled>
      </div>
    </Page>
  ),
};

export const NewTabStrip: StoryObj = {
  name: '7. After the click: new tab with strip',
  render: () => (
    <Shell>
      <NewTabWithStrip />
    </Shell>
  ),
};

export const AfterTheClick: StoryObj = {
  name: '7. Show the feed, not a signup page',
  render: () => (
    <Page
      eyebrow="Ideas 7 and 12 (7 is my pick)"
      title="Let people see what they just kept"
      intro="For signed-out clickers, both tabs end on onboarding today. About 91% get two onboarding pages within two minutes, and the new tab they were asked to keep disappears."
    >
      <div className="grid grid-cols-1 gap-6 laptop:grid-cols-2">
        <Flow
          label="Today"
          tone="before"
          primer={
            <>
              <FlowStep title="Click Open new tab" />
              <FlowStep title="Goes to /onboarding" tone="bad" />
            </>
          }
          newTab={
            <>
              <FlowStep title="Chrome asks Keep it?" />
              <FlowStep title="Also goes to /onboarding" tone="bad" />
            </>
          }
        />
        <Flow
          label="Idea"
          tone="after"
          primer={
            <>
              <FlowStep title="Click Show me my new tab" />
              <FlowStep
                title="Goes to /onboarding, in the background"
                tone="good"
              />
            </>
          }
          newTab={
            <>
              <FlowStep title="Chrome asks Keep it?" />
              <FlowStep
                title="Stays on the feed, with the sign-up strip"
                tone="good"
              />
            </>
          }
        />
      </div>
      <Section
        title="The new tab they would land on"
        note="This is the real strip, signed out. Notice it says Log in: it speaks to returning users, which is idea 12. The grey cards stand in for the feed."
      >
        <DesktopFrame storyId={`${ID}--new-tab-strip`} title="New tab" />
      </Section>
    </Page>
  ),
};

export const WinBack: StoryObj = {
  name: '16. Banner when the extension is off',
  render: () => (
    <Page
      eyebrow="Idea 16"
      title="Reach people who pressed Change it back"
      intro="The extension can't message anyone once it's off, but the web app can notice it's missing. This is for signed-in members who used it before. A web page can't open chrome://extensions, so the banner has to explain the steps."
    >
      <div className="flex max-w-[44rem] items-center gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
        <div className="min-w-0 flex-1">
          <p className="font-bold typo-callout">
            Your daily.dev extension is off in this browser
          </p>
          <p className="text-pretty text-text-tertiary typo-footnote">
            Turn it on in chrome://extensions to get your feed on every new tab
            again.
          </p>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
        >
          Show me how
        </Button>
      </div>
    </Page>
  ),
};
