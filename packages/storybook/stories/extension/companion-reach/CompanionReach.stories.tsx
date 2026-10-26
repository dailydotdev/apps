import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  MiniCloseIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import ExtensionProviders from '../_providers';
import {
  ArticleMock,
  BrowserWindow,
  CompanionPreview,
  CompanionPill,
  NewTabMock,
  Page,
  Scrim,
  Section,
  Tier,
  TierBadge,
} from './kit';
import {
  IdeaEcho,
  IdeaLabelledButton,
  IdeaLaterCard,
  IdeaOnboarding,
  IdeaPostModal,
  IdeaPostPage,
  IdeaReadMoment,
  IdeaReaderBundle,
  IdeaSetting,
  IdeaSupportRow,
  IdeaTips,
  IdeaToolbar,
  IdeaWhatsNew,
} from './ideas';

// Ideas for making the companion reachable, from the #7043 review thread:
// Ido's “no one will enable it this way, it’s like Google’s 2nd page” and
// Agent Smith's list, checked against the code. Drawn markup on production
// recipes plus the real TopHero, FeedWidgetTip, HijackingCoverStrip, Switch,
// Checkbox and ProfileSection. Nothing here ships; it is for picking arms.

const Card = ({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5">
    <span className="font-bold typo-callout">{title}</span>
    <div className="flex flex-col gap-2 text-pretty text-text-secondary typo-callout">
      {children}
    </div>
  </div>
);

const shortlist: {
  n: number;
  idea: string;
  tier: Tier;
  build: string;
  why: string;
}[] = [
  {
    n: 1,
    idea: 'Ask on the first Read click from the new tab',
    tier: Tier.Bet,
    build: 'M',
    why: 'Asks at the moment the companion is about to be useful',
  },
  {
    n: 2,
    idea: 'One grant for reader + companion',
    tier: Tier.Bet,
    build: 'S',
    why: 'Same permission; may already be happening, unlogged',
  },
  {
    n: 3,
    idea: 'Post page demo pill asks extension users',
    tier: Tier.Bet,
    build: 'M',
    why: 'The widget exists; it only talks to the wrong half',
  },
  {
    n: 4,
    idea: 'Companion tip + hero cover message',
    tier: Tier.Test,
    build: 'S',
    why: 'Where you want widgets to go anyway',
  },
  {
    n: 5,
    idea: 'Optional onboarding step after “Open new tab”',
    tier: Tier.Test,
    build: 'M',
    why: 'Highest willingness; risk to activation',
  },
  {
    n: 6,
    idea: 'The #7043 card, later and personal',
    tier: Tier.Test,
    build: 'S',
    why: 'Cheapest change to what ships',
  },
  {
    n: 7,
    idea: 'Labelled header / rail button',
    tier: Tier.Test,
    build: 'S',
    why: 'The 2022 placement winner, with a label this time',
  },
  {
    n: 8,
    idea: 'Next to “Read post” in the post modal',
    tier: Tier.Test,
    build: 'S',
    why: 'Same moment as #1, without interrupting',
  },
  {
    n: 9,
    idea: 'Try once from the toolbar icon (activeTab)',
    tier: Tier.Support,
    build: 'L',
    why: 'Only way to show it working before the warning',
  },
  {
    n: 10,
    idea: 'A switch in Customize',
    tier: Tier.Support,
    build: 'S',
    why: 'Where people look; doubles as the off switch',
  },
  {
    n: 11,
    idea: 'Echo in the upvote / bookmark toast',
    tier: Tier.Support,
    build: 'S',
    why: 'Targets people who already use those actions',
  },
  {
    n: 12,
    idea: 'One notification + changelog post',
    tier: Tier.Support,
    build: 'S',
    why: 'Reaches members who installed long ago',
  },
  {
    n: 13,
    idea: 'Support menu row',
    tier: Tier.Shipped,
    build: '—',
    why: 'The way back, not the way in',
  },
];

const ReadMe = (): ReactElement => (
  <Page
    eyebrow="Extension · companion reach · #7043 follow-up"
    title="Making the companion reachable"
    lead={
      <>
        #7043 moved the companion ask from an unlabelled square to a flagged
        card and a row in the Support menu. In review Ido asked where the button
        is now, and answered it himself: “no one will enable it this way. it’s
        like google’s 2nd page.” This page collects ways in, drawn on the
        surfaces they would live on, so we can pick what to test.
      </>
    }
  >
    <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
      <Card title="Where we are">
        <p>
          Per Agent Smith’s feature map (25 Oct, not re-measured here):{' '}
          <code>request content scripts</code> has about 0 events and{' '}
          <code>approve content scripts</code> has not been seen in 180 days.
          Any arm that works will show fast against that baseline.
        </p>
      </Card>
      <Card title="The fixed cost of every idea">
        <p>
          Every path ends on the browser’s own dialog: “Read and change all your
          data on all websites”. We cannot change it. What we control is whether
          the member already knows why they are seeing it — so each idea shows
          the companion before it asks.
        </p>
      </Card>
      <Card title="The browser rule">
        <p>
          <code>permissions.request</code> needs a click on an extension page —
          the new tab counts. Webapp pages can ask too, through the ping relay
          the reader already uses (RequestFrameEmbeddingPermissions), which
          keeps the click’s user gesture. So the ask is not limited to the new
          tab.
        </p>
      </Card>
    </div>

    <Section
      title="What the code says that the thread didn’t"
      lead="Checked in this branch, so the ideas below start from what exists."
    >
      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
        <Card title="1 · Reader opt-ins probably already have the companion">
          <p>
            The reader grants <code>declarativeNetRequestWithHostAccess</code>{' '}
            plus <code>*://*/*</code>. The companion only checks for{' '}
            <code>*://*/*</code>, and the background registers its scripts
            whenever that origin is present. No{' '}
            <code>approve content scripts</code> is logged on that path, so our
            zero may be an undercount. Confirm in a real browser first.
          </p>
        </Card>
        <Card title="2 · A companion demo already runs on post pages">
          <p>
            <code>companion_demo_widget</code> (CompanionDemoWidget) draws the
            companion pill on app.daily.dev posts for people who never used the
            extension, ending on “Install”. The members we need — extension
            installed, permission missing — never see it.
          </p>
        </Card>
        <Card title="3 · The header placement won once">
          <p>
            #982 (2022) A/B tested where to ask; the header stayed (
            <code>ExperimentWinner.CompanionPermissionPlacement</code> is still{' '}
            <code>&apos;header&apos;</code>). Layout v2 removed that header,
            which is how the ask became an unlabelled square.
          </p>
        </Card>
        <Card title="4 · The reader shows the pattern for #1">
          <p>
            <code>useReaderInstallPromptGate</code> intercepts a plain Read
            click once, sets a flag, and opens a modal. A companion gate on the
            same model is most of idea 1.
          </p>
        </Card>
      </div>
    </Section>

    <Section
      title="Shortlist"
      lead="Ranked by expected reach per unit of work. Each idea has its own drawing in the stories that follow; every Enable button there walks the browser dialog."
    >
      <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
        <table className="w-full min-w-[44rem] text-left typo-footnote">
          <thead className="bg-surface-float text-text-tertiary">
            <tr>
              <th className="px-4 py-2 font-bold">#</th>
              <th className="px-4 py-2 font-bold">Idea</th>
              <th className="px-4 py-2 font-bold">Tier</th>
              <th className="px-4 py-2 font-bold">Build</th>
              <th className="px-4 py-2 font-bold">Why</th>
            </tr>
          </thead>
          <tbody>
            {shortlist.map((row) => (
              <tr
                key={row.n}
                className="border-t border-border-subtlest-tertiary align-top"
              >
                <td className="px-4 py-2 tabular-nums text-text-tertiary">
                  {row.n}
                </td>
                <td className="px-4 py-2 font-bold">{row.idea}</td>
                <td className="px-4 py-2">
                  <TierBadge tier={row.tier} />
                </td>
                <td className="px-4 py-2 text-text-tertiary">{row.build}</td>
                <td className="px-4 py-2 text-text-secondary">{row.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>

    <Section
      title="Recommendation"
      lead="Two cheap moves first, then one test with three arms."
    >
      <ol className="flex max-w-[85ch] list-decimal flex-col gap-2 pl-5 text-text-secondary typo-callout">
        <li>
          <strong>Log the reader path</strong> (idea 2): emit{' '}
          <code>approve content scripts</code> with origin{' '}
          <code>reader permission</code> when the reader grant lands. It tells
          us how many members already have the companion, before we build
          anything.
        </li>
        <li>
          <strong>Ship the labelled button</strong> (idea 7) as the permanent
          entry, replacing what #7017 removed; keep the Support row as the way
          back.
        </li>
        <li>
          <strong>A/B the contextual asks</strong> against the #7043 card: Read
          click modal (1), post page pill (3), later card (6). Metric:{' '}
          <code>approve content scripts</code> per eligible member, split by{' '}
          <code>origin</code>. Guardrails: decline rate, extension uninstalls in
          the next 7 days, companion opt-outs.
        </li>
      </ol>
      <p className="max-w-[85ch] text-text-tertiary typo-footnote">
        Flags follow the widget convention already used for this card (
        <code>companion_permission_widget</code>): one boolean per surface, read
        through <code>useConditionalFeature</code> with a{' '}
        <code>shouldEvaluate</code> gate, e.g.{' '}
        <code>companion_read_prompt</code>, <code>companion_post_page_ask</code>
        . Names are placeholders.
      </p>
    </Section>
  </Page>
);

const Tiered = ({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
}): ReactElement => (
  <ExtensionProviders>
    <Page eyebrow={eyebrow} title={title} lead={lead}>
      <div className="flex flex-col gap-8">{children}</div>
    </Page>
  </ExtensionProviders>
);

const MainBets = (): ReactElement => (
  <Tiered
    eyebrow="Companion reach · 1–3"
    title="Main bets"
    lead="Ask at the moment the companion is about to help, or reuse a grant the member is already giving."
  >
    <IdeaReadMoment />
    <IdeaReaderBundle />
    <IdeaPostPage />
  </Tiered>
);

const WorthTesting = (): ReactElement => (
  <Tiered
    eyebrow="Companion reach · 4–8"
    title="Worth testing"
    lead="Cheaper surfaces that are always there, so reach comes from repetition rather than timing."
  >
    <IdeaTips />
    <IdeaOnboarding />
    <IdeaLaterCard />
    <IdeaLabelledButton />
    <IdeaPostModal />
  </Tiered>
);

const Supporting = (): ReactElement => (
  <Tiered
    eyebrow="Companion reach · 9–13"
    title="Supporting"
    lead="Not entry points on their own, but each covers a member the bets miss."
  >
    <IdeaToolbar />
    <IdeaSetting />
    <IdeaEcho />
    <IdeaWhatsNew />
    <IdeaSupportRow />
  </Tiered>
);

// --- Try it: idea 1 end to end ------------------------------------------------

type Step = 'newtab' | 'prompt' | 'dialog' | 'article';

const TryIt = (): ReactElement => {
  const [step, setStep] = useState<Step>('newtab');
  const [asked, setAsked] = useState(false);
  const [granted, setGranted] = useState(false);
  const [title, setTitle] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const push = (line: string) => setLog((lines) => [...lines, line]);

  const onRead = (postTitle: string) => {
    setTitle(postTitle);
    push(`go to link · ${postTitle}`);
    if (!asked && !granted) {
      setAsked(true);
      push('impression · companion read prompt');
      setStep('prompt');
      return;
    }
    setStep('article');
  };

  const onEnable = () => {
    push('request content scripts · {"origin":"companion read prompt"}');
    setStep('dialog');
  };

  const onDecide = (allow: boolean) => {
    push(
      allow
        ? 'approve content scripts · {"origin":"companion read prompt"}'
        : 'decline content scripts · {"origin":"companion read prompt"}',
    );
    setGranted(allow);
    setStep('article');
  };

  const reset = () => {
    setStep('newtab');
    setAsked(false);
    setGranted(false);
    setLog([]);
  };

  return (
    <Page
      eyebrow="Companion reach · idea 1, end to end"
      title="Try it"
      lead="Click Read on any card. The first click asks; later clicks go straight to the article. The panel on the right is what we would log."
    >
      <div className="grid grid-cols-1 gap-6 laptop:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-text-tertiary typo-footnote">
              {granted ? 'Permission granted' : 'Permission missing'}
              {asked && !granted ? ' · already asked once' : ''}
            </span>
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Float}
              onClick={reset}
              className="ml-auto"
            >
              Start over
            </Button>
          </div>
          {step === 'article' ? (
            <BrowserWindow
              url="frontendweekly.dev/react-re-renders"
              height={460}
            >
              <ArticleMock title={title}>
                {granted && <CompanionPill open />}
              </ArticleMock>
              <div className="absolute bottom-4 left-4 z-2">
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Float}
                  icon={<ArrowIcon className="-rotate-90" />}
                  onClick={() => setStep('newtab')}
                >
                  Back to the new tab
                </Button>
              </div>
            </BrowserWindow>
          ) : (
            <NewTabMock
              height={500}
              cards={6}
              onRead={onRead}
              overlay={
                (step === 'prompt' || step === 'dialog') && (
                  <Scrim onClose={() => setStep('newtab')}>
                    <div className="flex w-[28rem] flex-col items-center gap-4 rounded-24 bg-background-default p-6 text-center shadow-2">
                      <CompanionPreview title={title} />
                      <span className="font-bold typo-title3">
                        Take daily.dev to the article
                      </span>
                      <span className="text-pretty text-text-tertiary typo-callout">
                        See the TLDR, upvote and join the discussion right on
                        the page you’re reading.
                      </span>
                      <Button
                        type="button"
                        size={ButtonSize.Large}
                        variant={ButtonVariant.Primary}
                        className="w-full"
                        onClick={onEnable}
                        loading={step === 'dialog'}
                      >
                        Enable companion & read
                      </Button>
                      <Button
                        type="button"
                        variant={ButtonVariant.Float}
                        className="w-full"
                        onClick={() => {
                          push('skip · companion read prompt');
                          setStep('article');
                        }}
                      >
                        Just open the article
                      </Button>
                    </div>
                    {step === 'dialog' && (
                      <div className="absolute left-1/2 top-0 w-80 -translate-x-1/2 rounded-12 border border-border-subtlest-secondary bg-background-popover p-4 text-left shadow-2">
                        <span className="font-bold typo-footnote">
                          “daily.dev” requests additional permissions:
                        </span>
                        <p className="mt-2 typo-footnote">
                          • Read and change all your data on all websites
                        </p>
                        <div className="mt-3 flex justify-end gap-2">
                          <Button
                            type="button"
                            size={ButtonSize.XSmall}
                            variant={ButtonVariant.Float}
                            onClick={() => onDecide(false)}
                          >
                            Deny
                          </Button>
                          <Button
                            type="button"
                            size={ButtonSize.XSmall}
                            variant={ButtonVariant.Primary}
                            onClick={() => onDecide(true)}
                          >
                            Allow
                          </Button>
                        </div>
                      </div>
                    )}
                  </Scrim>
                )
              }
            />
          )}
        </div>
        <aside className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
          <span className="flex items-center justify-between font-bold typo-callout">
            Events
            {log.length > 0 && (
              <button
                type="button"
                aria-label="Clear events"
                onClick={() => setLog([])}
                className="text-text-quaternary"
              >
                <MiniCloseIcon size={IconSize.Small} />
              </button>
            )}
          </span>
          {log.length === 0 ? (
            <span className="text-text-quaternary typo-footnote">
              Nothing yet. Click Read on a card.
            </span>
          ) : (
            <ol className="flex flex-col gap-1 font-mono text-text-secondary typo-caption1">
              {log.map((line, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={i} className="break-words">
                  {line}
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    </Page>
  );
};

const meta: Meta = {
  title: 'Extension/Companion reach',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

export const ReadMeStory: Story = {
  name: '1. Read me',
  render: () => <ReadMe />,
};
export const MainBetsStory: Story = {
  name: '2. Main bets',
  render: () => <MainBets />,
};
export const WorthTestingStory: Story = {
  name: '3. Worth testing',
  render: () => <WorthTesting />,
};
export const SupportingStory: Story = {
  name: '4. Supporting',
  render: () => <Supporting />,
};
export const TryItStory: Story = {
  name: '5. Try it',
  render: () => (
    <ExtensionProviders>
      <TryIt />
    </ExtensionProviders>
  ),
};
