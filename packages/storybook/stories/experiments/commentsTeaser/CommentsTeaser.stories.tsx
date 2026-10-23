import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import PlaceholderComment from '@dailydotdev/shared/src/components/comments/PlaceholderComment';
import MainComment from '@dailydotdev/shared/src/components/comments/MainComment';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import ExtensionProviders, {
  bootAsAnonymous,
} from '../../extension/_providers';
import { Device, devices } from '../../history/device';
import { Callout, DocPage, Section, Table } from '../../history/doc';
import type { ReplyMode } from './CommentsTeaser';
import {
  commentsTitle,
  CommentsTeaser,
  SkeletonComment,
  VISIBLE_LIMIT,
  visibleComments,
} from './CommentsTeaser';
import { scenarioById, scenarios, totalOf } from './data';
import type { LaptopAsk } from './kit';
import {
  commentHandlers,
  postFor,
  ScrollToComments,
  SignupToast,
  TeaserPostPage,
  useSignupSpy,
} from './kit';
import type { Reveal } from './footers';
import { XFooterCard } from './footers';
import type { PromptAction } from './prompts';
import { actionCopy, DesktopActionPrompt, PhoneAppPrompt } from './prompts';

/**
 * Logged-out comment teaser, X style: three real comments, flat skeleton
 * comments, and the page's pinned footer asking. Plus X's logged-out
 * pop-ups, rebuilt. Storybook only — nothing in the app changes until a
 * direction is picked.
 */
const meta: Meta = {
  title: 'Experiments/Comments teaser',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: commentHandlers },
  },
  globals: { theme: 'dark' },
  beforeEach: () => {
    bootAsAnonymous();
  },
};

export default meta;

type Story = StoryObj;

const noop = (): void => undefined;

const Label = ({
  title,
  children,
}: {
  title: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <span className="font-bold typo-callout">{title}</span>
    {children && (
      <span className="text-text-tertiary typo-footnote">{children}</span>
    )}
  </div>
);

const Column = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('w-full max-w-[40rem]', className)}>
    {children}
  </div>
);

const laptopAskNames: Record<LaptopAsk, string> = {
  footer: 'X’s footer at the post column (instead of the banner)',
  banner: 'Banner stays, its headline takes the comment copy',
  today: 'Today: banner as is',
};

const scenarioArgType = {
  control: 'select' as const,
  options: scenarios.map((item) => item.id),
  labels: Object.fromEntries(scenarios.map((item) => [item.id, item.label])),
};

const revealArgType = {
  control: 'inline-radio' as const,
  options: ['x', 'onLoad'],
  labels: {
    x: 'X’s rule (1 screen, near the end, or 5s)',
    onLoad: 'On load (production’s phone footer today)',
  },
};

const repliesArgType = {
  control: 'inline-radio' as const,
  options: ['locked', 'counted'],
  labels: {
    locked: 'Folded behind sign-up',
    counted: 'Counted inside the 3',
  },
};

/* ------------------------------------------------------------- 1. Brief */

export const Brief: Story = {
  name: '1. Brief',
  render: () => (
    <DocPage
      eyebrow="Experiment · logged-out post page"
      title="Show a little of the discussion, then ask to join it"
      intro={
        <>
          <p>
            Logged-out readers see every comment today. The idea, from X: show
            three, then flat skeleton comments where the rest would be, with the
            page’s pinned footer saying “See all the comments”. With no comments
            the skeleton alone sets the scene and the footer says “Join the
            conversation”.
          </p>
          <p>
            Storybook only, on the real post page with the production comment
            and footer components. Nothing in the app changes until a direction
            is picked.
          </p>
        </>
      }
    >
      <Section
        title="What won and what lost (GrowthBook, via Smith, 21 Oct 2026)"
        lead="The bars and sheets this builds on."
      >
        <Table
          head={['Experiment', 'What it tested', 'Result']}
          rows={[
            [
              'mobile_app_footer',
              'Phone, logged out: pinned footer “See all posts” + “Open daily.dev app”, over a fade.',
              'WON, shipped (#6899). Native app usage +167% (96% chance to win), D1 retention +73% (81%). GrowthBook notes it cut mobile ad clicks by 55%, a fix to follow.',
            ],
            [
              'mobile_app_sheet',
              'Phone: “See daily.dev in…” App / Browser bottom sheet.',
              'LOST, removed today (#6980). App usage −3.6%, retention −0.4%.',
            ],
            [
              'signup_strip_column',
              'Laptop: the bottom sign-up banner’s column layout.',
              'WON, shipped (#6962). Sign-ups +14.2% (98%).',
            ],
            [
              'post_signup_strip',
              'Laptop post page: a card pinned at the content’s width instead of the full-width banner.',
              'LOST. Pinned card sign-ups −47%. Full-width banner kept (flag still in code, default off).',
            ],
          ]}
        />
        <Callout title="What that means here" tone="brand">
          <p>
            <strong>Phone:</strong> the pinned footer you meant is the one that
            won. It already shows on post pages (“See all posts”), so the phone
            change is only its title, plus the skeleton in the thread. Same
            component, same design, same button.
          </p>
          <p>
            <strong>Laptop:</strong> you asked for a variant like the mobile
            footer. It is built below, pinned to the post column like X’s bar.
            Before testing it: the closest thing we have tried, a card pinned at
            the content’s width, lost sign-ups by 47% to the full-width banner.
            So the laptop story shows both: X’s centred footer, and the winning
            banner speaking for the comments. My suggestion is to test them
            against each other rather than ship the footer straight.
          </p>
        </Callout>
      </Section>

      <Section
        title="What X does, logged out (checked 21 Oct 2026)"
        lead="Three posts (43K, 1 and 0 replies), phone (375px, Android) and desktop."
      >
        <Table
          head={['Where', 'What happens']}
          rows={[
            [
              'Replies, both',
              'Exactly 3 replies, then 2 still skeleton replies. With 0 replies, skeletons only.',
            ],
            [
              'Pinned footer, both',
              'Centred heading “See all the replies” (“Join the conversation” at 0, never a number) and one full-width pill, no “Log in” beside it: “Continue to X” opens the log-in flow, which also offers sign-up. Phone: “Open X App” to the store. Desktop: pinned to the centre column’s width.',
            ],
            [
              'Footer timing, both (from X’s code)',
              'Not there on load. Appears on the first of: scrolled one full screen, within 168px of the page end, a page that barely scrolls after 1.5s, or 5s. Then animates in: fade unfurls from the bottom (700ms), heading rises out of a 6px blur (+180ms), button springs up (+320ms), tapping hand fades in at 1.1s. Reduced motion: fades only.',
            ],
            [
              'Skeleton count',
              'At least 2, then as many as fill the window below, so the page never ends in empty space. No shimmer.',
            ],
            [
              'Pop-up on load, phone',
              'Every post page load, no cap, dismissal not remembered: centred card on a 20% black backdrop, the post author’s avatar (88px), “See this post in the app”, “Use the app to view all comments and discover more posts.”, black “Open X” pill with an animated tapping hand, round close button top-right. Backdrop tap closes it.',
            ],
            [
              'Actions, phone',
              'Like, reply, repost go straight to the app store.',
            ],
            [
              'Pop-up on load, desktop',
              'None. The sign-up card sits in the right column.',
            ],
            [
              'Actions, desktop',
              'A card per action: icon in the action’s colour, “Like a post to share the love.” / “Reply to join the conversation.” / “Repost to spread the word.”, a line naming the author, “Log in” (solid) and “Sign up” (outline).',
            ],
          ]}
        />
      </Section>

      <Section title="The proposal">
        <Table
          head={['Rule', 'Why']}
          rows={[
            ['Logged out only', 'Members already have the whole thread.'],
            [
              `First ${VISIBLE_LIMIT} top-level comments, in the page’s sort order`,
              'X’s number: proves the discussion is real without replacing it.',
            ],
            [
              'Replies under them stay folded; “N Replies” opens sign-up',
              'The post page’s own collapsed thread row, so a 40-reply thread under comment 1 does not give the discussion away.',
            ],
            [
              'Then 2 flat skeleton comments, same shape as the page’s comments',
              'The thread style the post page uses today: no card, 40px avatar, text and actions on the 52px column. Static, so it reads as locked, not loading.',
            ],
            [
              'The pinned footer asks, with X’s timing and entrance; its title follows the comments',
              'X’s copy, word for word with daily.dev’s noun: “See all the comments” when the post has any comment (one is enough, as on X), “Join the conversation” when it has none. No number: X shows none, and none of our phone footer’s titles do either.',
            ],
            [
              'The skeleton and folded replies open sign-up too',
              'Tapping the grey comment is the strongest intent on the page.',
            ],
            [
              'End-of-thread share band hidden while the teaser is on',
              'It would ask to share a discussion the reader has not seen.',
            ],
          ]}
        />
      </Section>

      <Section title="X’s pop-ups for daily.dev (built in “5. X pop-ups”)">
        <div className="grid gap-4 laptop:grid-cols-2">
          <Callout title="Phone: “See this post in the app” on load">
            <p>
              Rebuilt as X does it: every post page load, one button (“Open
              daily.dev app”), close and backdrop tap dismiss, the post’s source
              image on the card.
            </p>
            <p>
              Two cautions. Our nearest try, the App / Browser sheet, lost
              today. And Google ranks pages lower when a full-screen pop-up
              covers them right after a search click; X can afford that, we get
              much of our phone traffic from search. The footer already skips
              search landings (isSearchEngineLanding); a pop-up must too.
            </p>
          </Callout>
          <Callout title="Desktop: a small card per action">
            <p>
              Today a logged-out upvote opens the full sign-up modal. X opens a
              short card first that says what the tap would have done (“Upvote
              to back the good stuff.”) with Log in and Sign up. Built for
              upvote, comment, bookmark and comment upvotes.
            </p>
          </Callout>
        </div>
      </Section>

      <Section title="Before building it in the app">
        <div className="grid gap-4 laptop:grid-cols-2">
          <Callout title="SEO: comments Google can index" tone="warn">
            <p>
              Comments are not in the server HTML; Google sees them by running
              the page as a logged-out visitor, so it would see 3. The
              server-rendered SEO schema keeps the top 5. Either accept it, or
              keep the full list for crawlers with paywall markup
              (isAccessibleForFree on the hidden part). Worth a word with
              whoever owns SEO.
            </p>
          </Callout>
          <Callout title="How it ships">
            <p>
              A GrowthBook flag evaluated only for logged-out readers. A new
              sign-up trigger, “comments teaser”, so its sign-ups are counted on
              their own. Phone: the footer’s existing impression and app-click
              events carry the new title. Success: sign-ups (laptop) and app
              opens (phone) per logged-out post visit. Guardrails: time on page,
              ad clicks (the footer already cost 55% on phones), organic clicks
              to post pages.
            </p>
          </Callout>
          <Callout title="Open questions for you">
            <p>
              1. Laptop: X’s centred column footer, or banner with comment copy,
              or test both?
            </p>
            <p>
              2. Phone footer button: keep “Open daily.dev app” (what won), or
              sign-up?
            </p>
            <p>4. Replies: folded behind sign-up, or counted inside the 3?</p>
            <p>
              5. X’s pop-ups: test the phone one at all, given the sheet result
              and search?
            </p>
          </Callout>
        </div>
      </Section>
    </DocPage>
  ),
};

/* ------------------------------------------------------------- 2. Phone */

interface PhoneArgs {
  scenario: string;
  replies: ReplyMode;
  reveal: Reveal;
}

const PhonePage = ({ scenario, replies, reveal }: PhoneArgs): ReactElement => {
  const spy = useSignupSpy();
  const current = scenarioById(scenario);
  return (
    <DocPage
      eyebrow="Comments teaser · phone"
      title="The winning footer, speaking for the comments"
      intro={
        <p>
          The real post page at 375px, logged out. The footer is production’s
          MobileAppFooter, unchanged except its title. Left is today (“See all
          posts”, every comment), the others are the teaser. Each phone opens at
          the comments and scrolls on its own.
        </p>
      }
    >
      <div className="flex flex-wrap items-start gap-10">
        <Device {...devices.phone} fit={false} label="Today">
          <TeaserPostPage
            key={`today-${scenario}`}
            scenario={current}
            device="phone"
            teaser={false}
            emit={spy.emit}
          />
          <ScrollToComments />
        </Device>
        <Device
          {...devices.phone}
          fit={false}
          label={`Teaser · ${current.label}`}
        >
          <TeaserPostPage
            key={`teaser-${scenario}-${replies}-${reveal}`}
            scenario={current}
            device="phone"
            replies={replies}
            reveal={reveal}
            emit={spy.emit}
          />
          <ScrollToComments />
        </Device>
        <Device {...devices.phone} fit={false} label="Teaser · No comments">
          <TeaserPostPage
            key={`none-${replies}-${reveal}`}
            scenario={scenarioById('none')}
            device="phone"
            replies={replies}
            reveal={reveal}
            emit={spy.emit}
          />
          <ScrollToComments />
        </Device>
      </div>
      <SignupToast event={spy.event} />
    </DocPage>
  );
};

export const Phone: StoryObj<PhoneArgs> = {
  name: '2. Phone',
  args: {
    scenario: 'many',
    replies: 'locked',
    reveal: 'x',
  },
  argTypes: {
    scenario: scenarioArgType,
    replies: repliesArgType,
    reveal: revealArgType,
  },
  render: (args) => <PhonePage {...args} />,
};

/* ------------------------------------------------------------ 3. Laptop */

interface LaptopArgs extends PhoneArgs {
  laptopAsk: LaptopAsk;
}

const laptopAskNotes: Record<LaptopAsk, string> = {
  footer:
    'X’s desktop footer: centred title, one “Continue to daily.dev” button (opens the auth modal, which has log-in and sign-up, so no second button), X’s fade and entrance, X’s reveal (after a screen of scrolling, near the end, or 5s). Replaces the full-width banner on the post page. Careful: the content-width pinned card lost −47% sign-ups to the banner.',
  banner:
    'Keeps the winner (+14% sign-ups). Its headline switches to the comment copy once the comments are on screen.',
  today: 'Production today.',
};

const LaptopPage = ({
  scenario,
  replies,
  laptopAsk,
  reveal,
}: LaptopArgs): ReactElement => {
  const spy = useSignupSpy();
  const current = scenarioById(scenario);
  return (
    <DocPage
      eyebrow="Comments teaser · laptop"
      title="Laptop: a footer like the mobile one"
      intro={
        <p>
          The real post page at 1440px, logged out. Switch “laptopAsk” in
          Controls between X’s centred footer pinned to the post column (your
          ask), the winning banner with comment copy, and today.
        </p>
      }
    >
      <Label title={laptopAskNames[laptopAsk]}>
        {laptopAskNotes[laptopAsk]}
      </Label>
      <Device {...devices.laptopL}>
        <TeaserPostPage
          key={`${scenario}-${replies}-${laptopAsk}-${reveal}`}
          scenario={current}
          device="laptop"
          replies={replies}
          teaser={laptopAsk !== 'today'}
          laptopAsk={laptopAsk}
          reveal={reveal}
          emit={spy.emit}
        />
        <ScrollToComments offset={120} />
      </Device>
      <SignupToast event={spy.event} />
    </DocPage>
  );
};

export const Laptop: StoryObj<LaptopArgs> = {
  name: '3. Laptop',
  args: {
    scenario: 'many',
    replies: 'locked',
    laptopAsk: 'footer',
    reveal: 'x',
  },
  argTypes: {
    scenario: scenarioArgType,
    replies: repliesArgType,
    reveal: revealArgType,
    laptopAsk: {
      control: 'inline-radio',
      options: ['footer', 'banner', 'today'],
      labels: laptopAskNames,
    },
  },
  render: (args) => <LaptopPage {...args} />,
};

/* --------------------------------------------------------- 4. Use cases */

const UseCases = ({ replies }: { replies: ReplyMode }): ReactElement => {
  const spy = useSignupSpy();
  return (
    <DocPage
      eyebrow="Comments teaser"
      title="Every case the comment section can be in"
      intro={
        <p>
          The thread at the post page’s width, logged out, with the footer title
          each case gets. Tap the skeleton or a folded “Replies” row to see what
          it opens.
        </p>
      }
    >
      <div className="grid gap-x-10 gap-y-16 laptopL:grid-cols-2">
        {scenarios.map((scenario) => {
          const total = totalOf(scenario);
          const { count } = visibleComments(
            scenario.comments,
            VISIBLE_LIMIT,
            replies,
          );
          return (
            <Column key={scenario.id}>
              <Label title={scenario.label}>
                {scenario.summary} · {count} of {total} on screen · footer: “
                {commentsTitle(total)}”
              </Label>
              <CommentsTeaser
                post={postFor(scenario)}
                comments={scenario.comments}
                replies={replies}
                onSignup={spy.emit}
                fillScreen={false}
                className="!mb-0"
              />
              <div className="mt-2 overflow-hidden rounded-16 border border-border-subtlest-tertiary pt-16">
                <XFooterCard
                  title={commentsTitle(total)}
                  cta="Continue to daily.dev"
                  onContinue={() => spy.emit('footer')}
                  animate={false}
                />
              </div>
            </Column>
          );
        })}
      </div>
      <SignupToast event={spy.event} />
    </DocPage>
  );
};

export const AllUseCases: StoryObj<{ replies: ReplyMode }> = {
  name: '4. Use cases',
  args: { replies: 'locked' },
  argTypes: { replies: repliesArgType },
  render: (args) => <UseCases {...args} />,
};

/* --------------------------------------------------------- 5. X pop-ups */

const XPopups = (): ReactElement => {
  const spy = useSignupSpy();
  const [phoneKey, setPhoneKey] = useState(0);
  const [preview, setPreview] = useState<PromptAction>();
  const scenario = scenarioById('many');
  const post = postFor(scenario);
  return (
    <DocPage
      eyebrow="Comments teaser · X’s pop-ups"
      title="X’s logged-out pop-ups, copied"
      intro={
        <>
          <p>
            Phone: X opens “See this post in the app” on every post page load.
            Close it with ×, a backdrop tap or Escape; “Reload the page” brings
            it back, like X. On X, tapping like or reply afterwards goes to the
            app store; here a toast says so.
          </p>
          <p>
            Laptop: nothing on load. Tap upvote, comment, “Share your thoughts”,
            bookmark or a comment’s upvote and the X-style card opens instead of
            today’s full sign-up modal.
          </p>
        </>
      }
    >
      <Section title="Phone · on load">
        <div className="flex flex-col items-start gap-3">
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            onClick={() => setPhoneKey((key) => key + 1)}
          >
            Reload the page
          </Button>
          <Device {...devices.phone} fit={false}>
            <TeaserPostPage
              key={phoneKey}
              scenario={scenario}
              device="phone"
              appPrompt
              emit={spy.emit}
            />
          </Device>
        </div>
      </Section>

      <Section title="Laptop · on an action">
        <Device {...devices.laptopL}>
          <TeaserPostPage
            scenario={scenario}
            device="laptop"
            laptopAsk="footer"
            actionPrompts
            emit={spy.emit}
          />
        </Device>
      </Section>

      <Section title="Every action card" lead="Click one to open it.">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(actionCopy) as PromptAction[]).map((action) => (
            <Button
              key={action}
              variant={ButtonVariant.Float}
              size={ButtonSize.Medium}
              onClick={() => setPreview(action)}
            >
              {actionCopy[action].title}
            </Button>
          ))}
        </div>
        <Table
          head={['X', 'daily.dev']}
          rows={[
            [
              'Like a post to share the love. · Join X now to let {author} know you like their post.',
              `${actionCopy.upvote.title} · ${actionCopy.upvote.line(
                '{author}',
              )}`,
            ],
            [
              'Reply to join the conversation. · Once you join X, you can respond to {author}’s post.',
              `${actionCopy.reply.title} · ${actionCopy.reply.line(
                '{author}',
              )}`,
            ],
            [
              'Repost to spread the word. · When you join X, you can share {author}’s post with your followers.',
              `${actionCopy.bookmark.title} · ${actionCopy.bookmark.line('')}`,
            ],
            [
              '(no comment-like card on X)',
              `${
                actionCopy.commentUpvote.title
              } · ${actionCopy.commentUpvote.line('')}`,
            ],
          ]}
        />
      </Section>
      {preview && (
        <DesktopActionPrompt
          action={preview}
          name={post.source?.name ?? 'the author'}
          onClose={() => setPreview(undefined)}
          onLogin={() => {
            setPreview(undefined);
            spy.emit('login');
          }}
          onSignup={() => {
            setPreview(undefined);
            spy.emit('action');
          }}
        />
      )}
      <SignupToast event={spy.event} />
    </DocPage>
  );
};

export const Popups: Story = {
  name: '5. X pop-ups',
  render: () => <XPopups />,
};

/* -------------------------------------------------- 6. Skeleton anatomy */

export const Anatomy: Story = {
  name: '6. Skeleton anatomy',
  render: () => {
    const scenario = scenarioById('one');
    const post = postFor(scenario);
    return (
      <DocPage
        eyebrow="Comments teaser"
        title="The skeleton comment"
        intro={
          <p>
            Drawn on the post page’s flat, thread-style comment, so the swap
            from real to grey has no jump: no card, 40px avatar, name · handle ·
            time with the badge under it, text and actions on the 52px column.
            Static, and deliberately different from the loading placeholder,
            which pulses card-shaped blocks.
          </p>
        }
      >
        <div className="grid gap-8 laptopL:grid-cols-3">
          <Column>
            <Label title="Real comment (post page, thread style)" />
            <div className="mt-5">
              <MainComment
                comment={scenario.comments[0]}
                post={post}
                origin={Origin.ArticlePage}
                isModalThread
                onShare={noop}
                onDelete={noop}
                onShowUpvotes={noop}
                onCommented={noop}
                postAuthorId={null}
                postScoutId={null}
              />
            </div>
          </Column>
          <Column>
            <Label title="Teaser skeleton (new)" />
            <div className="mt-5">
              <SkeletonComment />
            </div>
          </Column>
          <Column>
            <Label title="Loading placeholder (today, unchanged)" />
            <div className="mt-1">
              <PlaceholderComment />
            </div>
          </Column>
        </div>
      </DocPage>
    );
  },
};

/* ------------------------------------------- 7. Pop-up cards, on their own */

export const PopupCards: Story = {
  name: '7. Pop-up cards (static)',
  render: () => {
    const post = postFor(scenarioById('many'));
    return (
      <DocPage eyebrow="Comments teaser" title="The pop-up cards on their own">
        <Section title="Phone · See this post in the app">
          <div className="relative h-[34rem] max-w-[23.4375rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary [transform:translateZ(0)]">
            <PhoneAppPrompt post={post} onClose={noop} onOpenApp={noop} />
          </div>
        </Section>
        <Section title="Laptop · Upvote">
          <div className="relative h-[30rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary [transform:translateZ(0)]">
            <DesktopActionPrompt
              action="upvote"
              name={post.source?.name ?? 'the author'}
              onClose={noop}
              onLogin={noop}
              onSignup={noop}
            />
          </div>
        </Section>
      </DocPage>
    );
  },
};

/* ------------------------------------------------ 8. Demo (full window) */

interface DemoArgs {
  scenario: string;
  device: 'phone' | 'tablet' | 'laptop';
  teaser: boolean;
  /** Phone: X's "See this post in the app" card on load. */
  appPrompt: boolean;
  /** Tablet / laptop: X's card on upvote, comment and bookmark. */
  actionPrompts: boolean;
}

const Demo = ({
  scenario,
  device,
  teaser,
  appPrompt,
  actionPrompts,
}: DemoArgs): ReactElement => {
  const spy = useSignupSpy();
  // The theme decorator sets the class after the first paint; a recording
  // must start dark, so the page's own timers (pop-up, footer) start on
  // screen.
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }
  return (
    <ExtensionProviders>
      <div className="min-h-screen bg-background-default text-text-primary">
        <TeaserPostPage
          key={`${scenario}-${device}-${teaser}-${appPrompt}-${actionPrompts}`}
          scenario={scenarioById(scenario)}
          device={device}
          teaser={teaser}
          laptopAsk={teaser ? 'footer' : 'today'}
          appPrompt={appPrompt}
          actionPrompts={actionPrompts}
          emit={spy.emit}
        />
      </div>
      <SignupToast event={spy.event} />
    </ExtensionProviders>
  );
};

/**
 * One post page filling the whole window, for recording demos at a real
 * device size (open the story's iframe at that size). Pick the device and
 * today / teaser in Controls.
 */
export const DemoFrame: StoryObj<DemoArgs> = {
  name: '8. Demo (full window)',
  args: {
    scenario: 'many',
    device: 'phone',
    teaser: true,
    appPrompt: false,
    actionPrompts: false,
  },
  argTypes: {
    scenario: scenarioArgType,
    device: {
      control: 'inline-radio' as const,
      options: ['phone', 'tablet', 'laptop'],
    },
  },
  render: (args) => <Demo {...args} />,
};
