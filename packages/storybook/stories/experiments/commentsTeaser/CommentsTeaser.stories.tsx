import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import PlaceholderComment from '@dailydotdev/shared/src/components/comments/PlaceholderComment';
import { bootAsAnonymous } from '../../extension/_providers';
import { Device, devices } from '../../history/device';
import { Callout, DocPage, Section, Table } from '../../history/doc';
import type { GateVariant, ReplyMode } from './CommentsTeaser';
import {
  CommentsTeaser,
  gateCopy,
  SkeletonComment,
  SkeletonGate,
  visibleComments,
  VISIBLE_LIMIT,
} from './CommentsTeaser';
import { scenarioById, scenarios, totalOf } from './data';
import {
  commentHandlers,
  postFor,
  ScrollToComments,
  SignupToast,
  TeaserPostPage,
  useSignupSpy,
} from './kit';

/**
 * Logged-out comment teaser, X style: three real comments, then skeleton
 * comments under a fade with a sign-up ask. Storybook only — nothing in the
 * app changes until a direction is picked.
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

const variantNames: Record<GateVariant, string> = {
  inline: 'A · Inline gate',
  providers: 'B · Inline gate + Google/GitHub',
  bar: 'C · Hybrid: the bottom bar asks on laptop',
};

const variantSummaries: Record<GateVariant, string> = {
  inline:
    'X’s pattern as is: skeleton comments fade into a heading and one sign-up button, at the end of the comment section.',
  providers:
    'Same gate, but the one-tap Google and GitHub buttons the sticky bar already uses sit on it, so sign-up starts in place.',
  bar: 'Laptop already has a bottom sign-up bar, so the gate there only says what is behind it, and the bar’s headline switches to the comment copy while the comments are on screen. Phones and tablets have no bottom bar, so the gate asks with the sign-up buttons (B).',
};

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

/** A post column as wide as the post page's (640px of comment area). */
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
            Logged-out visitors read every comment today and never need an
            account to do it. The idea, borrowed from X: show the first three
            comments, then skeleton comments under a fade with a sign-up ask.
            With no comments at all, the skeleton alone sets the scene and the
            ask becomes &ldquo;Join the conversation&rdquo;.
          </p>
          <p>
            Everything below is Storybook only, built from the production
            comment components on a real post page. Nothing in the app changes
            until a direction is picked.
          </p>
        </>
      }
    >
      <Section
        title="What X does (checked logged out, 21 Oct 2026)"
        lead="Three real posts: one with 43K replies, one with 1, one with 0."
      >
        <Table
          head={['Case', 'What a logged-out reader sees']}
          rows={[
            [
              'Many replies (43K)',
              'Exactly 3 replies, then 2 skeleton replies under a fixed bottom panel: “See all the replies” + “Continue to X”.',
            ],
            [
              '1 reply',
              'The 1 reply, the same skeleton and the same “See all the replies”, even though nothing is hidden.',
            ],
            [
              '0 replies',
              'Skeleton replies only, and the heading switches to “Join the conversation”.',
            ],
            [
              'Skeleton',
              'Static (no pulse), 8% grey, all fully rounded: 40px avatar, name 112×14, handle 80×12, time 24×12, two text lines (100% and ~92%), action row of 16px dots with short count bars.',
            ],
            [
              'Fade',
              'Gradient to the page background: solid from 52%, 45% at 84%, clear at the top. The ask sits on the solid part.',
            ],
            ['Button', 'Goes to log-in with a redirect back to the same post.'],
          ]}
        />
      </Section>

      <Section title="What daily.dev does today">
        <Table
          head={['Surface', 'Logged out today']}
          rows={[
            [
              'Comment list',
              'Every comment and every reply, fetched in the browser (not in the server HTML). Replying, voting and reporting open sign-up.',
            ],
            [
              '“Share your thoughts”',
              'The comment box above the list already opens sign-up (trigger “new comment”).',
            ],
            [
              'Laptop bottom bar',
              'The 284px sign-up bar (“Where developers suffer together”, or a personalised headline) with Google / GitHub / email. Its strip variant is in test as post_signup_strip.',
            ],
            [
              'Phone / tablet',
              'A top bar with Log in / Sign up. No bottom bar.',
            ],
            [
              'No comments',
              'The charm empty state: “No comments yet — The discussion is waiting for a spark.”',
            ],
          ]}
        />
      </Section>

      <Section title="The proposal">
        <Table
          head={['Rule', 'Why']}
          rows={[
            [
              'Logged out only; logged-in readers see no change',
              'The point is sign-up. Members already have the whole thread.',
            ],
            [
              `Show the first ${VISIBLE_LIMIT} top-level comments, in the page’s sort order`,
              'X’s number. Enough to prove the discussion is real and worth joining, not enough to replace it.',
            ],
            [
              'Replies under those comments are folded: “View N replies” opens sign-up',
              'A thread of 40 replies under comment 1 would otherwise give the whole discussion away. Uses the production CollapsedRepliesPreview row.',
            ],
            [
              'Then 2 skeleton comments under X’s fade, and the ask on the fade',
              'Shapes of comments read as “more is here”, a grey box reads as nothing.',
            ],
            [
              'Static skeleton, no pulse',
              'A pulse says “loading”, so people wait. A still shape says “locked”, so people act.',
            ],
            [
              'The copy only teases when something is hidden',
              '“See all 11 comments” when there is more; “Join the conversation” when every comment is already on screen or there are none. X teases even with 1 reply; we stay honest.',
            ],
            [
              'Comments are never cut mid-text',
              'The gate starts after whole comments; a long first comment shows in full.',
            ],
            [
              'The gate, the skeleton, and “View replies” all open sign-up',
              'Tapping the grey comment is the strongest intent signal on the page.',
            ],
            [
              'The end-of-thread share band is hidden while the gate is on',
              'It would sit under a locked discussion, asking to share something the reader has not seen.',
            ],
          ]}
        />
      </Section>

      <Section
        title="Copy"
        lead="Every case the gate can be in. Counts use the real post total (replies included), compact above 999."
      >
        <Table
          head={['Case', 'Heading', 'Line', 'Button']}
          rows={[
            [0, 0],
            [2, 0],
            [11, 8],
            [1214, 1211],
          ].map(([total, hidden]) => {
            const copy = gateCopy(total, hidden);
            return [
              total === 0
                ? 'No comments'
                : hidden === 0
                ? `${total} comments, all on screen`
                : `${total} comments, ${hidden} hidden`,
              copy.title,
              copy.description,
              copy.cta,
            ];
          })}
        />
      </Section>

      <Section title="Three ways to ask (pick one)">
        <div className="grid gap-4 laptop:grid-cols-3">
          {(Object.keys(variantNames) as GateVariant[]).map((variant) => (
            <Callout key={variant} title={variantNames[variant]}>
              <p>{variantSummaries[variant]}</p>
            </Callout>
          ))}
        </div>
        <Callout title="My recommendation" tone="brand">
          <p>
            <strong>C, the hybrid.</strong> On the real laptop page (see “4. On
            the post page”), A and B stack a second sign-up ask right above the
            bottom bar: two Google buttons on one screen. C gives the bar the
            comment copy instead (“See all 11 comments”), so laptop keeps one
            ask, and phones and tablets, where there is no bottom bar, get B’s
            one-tap buttons at the end of the discussion.
          </p>
          <p>
            One thing to line up: post_signup_strip is testing a smaller pinned
            strip against that bar. C works with either, but both tests change
            the same laptop surface, so run them one after the other or in
            exclusive namespaces.
          </p>
        </Callout>
      </Section>

      <Section title="Before building it in the app">
        <div className="grid gap-4 laptop:grid-cols-2">
          <Callout title="SEO: comments Google can index" tone="warn">
            <p>
              Comments are not in the server HTML today; Google only sees them
              by running the page’s JavaScript, as a logged-out visitor. Gated,
              it would see 3 comments instead of all. The server-rendered SEO
              schema already carries the top 5 comments, and that stays.
            </p>
            <p>
              Options: accept it (comments are a small part of the page’s text),
              or keep the full list for crawlers with paywall markup
              (isAccessibleForFree on the hidden part), which is the allowed way
              to show crawlers more than a gated visitor. Worth a word with
              whoever owns SEO before launch.
            </p>
          </Callout>
          <Callout title="How it ships">
            <p>
              A GrowthBook flag, evaluated only for logged-out readers
              (useConditionalFeature, like post_signup_strip). False is today. A
              new sign-up trigger, “comments teaser”, so sign-ups from the gate
              are counted on their own (plus a line for it in the phone sign-up
              screen’s subtitles). An impression event when the gate is first on
              screen.
            </p>
            <p>
              Success: sign-ups per logged-out post-page visit. Guardrails: time
              on page, comment-section scroll depth, and organic search clicks
              to post pages.
            </p>
          </Callout>
          <Callout title="Where it applies">
            <p>
              The post page and the post modal (same component). Not the /read
              template, which deliberately has no sign-up surfaces, and not the
              reader modal’s side rail (a separate list; can follow).
            </p>
          </Callout>
          <Callout title="Open questions for you">
            <p>1. Variant: A, B, or C (recommended)?</p>
            <p>
              2. Replies: folded behind sign-up (shown here), or counted inside
              the 3?
            </p>
            <p>3. Keep the full comments for crawlers, or accept 3?</p>
            <p>4. Limit: 3 like X, or test 3 against 5?</p>
          </Callout>
        </div>
      </Section>
    </DocPage>
  ),
};

/* ---------------------------------------------------------- 2. Use cases */

interface CaseArgs {
  variant: GateVariant;
  replies: ReplyMode;
}

const caseArgTypes = {
  variant: {
    control: 'inline-radio',
    options: ['inline', 'providers', 'bar'],
    labels: variantNames,
  },
  replies: {
    control: 'inline-radio',
    options: ['locked', 'counted'],
    labels: {
      locked: 'Folded behind sign-up',
      counted: 'Counted inside the 3',
    },
  },
};

const UseCases = ({ variant, replies }: CaseArgs): ReactElement => {
  const spy = useSignupSpy();
  return (
    <DocPage
      eyebrow="Comments teaser"
      title="Every case the comment section can be in"
      intro={
        <p>
          {variantNames[variant]}. Real comment components, logged out. Click
          anything grey, the gate, or “View replies” to see what it opens.
          Switch the variant and the reply rule in Controls.
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
                {scenario.summary} · {count} of {total} on screen
              </Label>
              <CommentsTeaser
                post={postFor(scenario)}
                comments={scenario.comments}
                numComments={total}
                variant={variant}
                replies={replies}
                onSignup={spy.onSignup}
                onLogin={spy.onLogin}
                className="!mx-0"
              />
            </Column>
          );
        })}
      </div>
      <SignupToast event={spy.event} />
    </DocPage>
  );
};

export const AllUseCases: StoryObj<CaseArgs> = {
  name: '2. Use cases',
  args: { variant: 'providers', replies: 'locked' },
  argTypes: caseArgTypes,
  render: (args) => <UseCases {...args} />,
};

/* ------------------------------------------------------- 3. Gate variants */

const GateVariants = (): ReactElement => {
  const spy = useSignupSpy();
  const rows = ['many', 'three', 'none'].map(scenarioById);
  return (
    <DocPage
      eyebrow="Comments teaser"
      title="Three ways to ask, side by side"
      intro={
        <p>
          The gate only, under the same comments. C’s real ask is the page’s
          bottom bar, see “4. On the post page”.
        </p>
      }
    >
      {rows.map((scenario) => (
        <Section key={scenario.id} title={scenario.label}>
          <div className="grid gap-8 laptopL:grid-cols-3">
            {(Object.keys(variantNames) as GateVariant[]).map((variant) => (
              <Column key={variant}>
                <Label title={variantNames[variant]} />
                <div className="mt-4">
                  <SkeletonGate
                    total={totalOf(scenario)}
                    hidden={
                      totalOf(scenario) -
                      visibleComments(
                        scenario.comments,
                        VISIBLE_LIMIT,
                        'locked',
                      ).count
                    }
                    variant={variant}
                    onSignup={spy.onSignup}
                    onLogin={spy.onLogin}
                  />
                </div>
              </Column>
            ))}
          </div>
        </Section>
      ))}
      <SignupToast event={spy.event} />
    </DocPage>
  );
};

export const Variants: Story = {
  name: '3. Gate variants',
  render: () => <GateVariants />,
};

/* --------------------------------------------------- 4. On the post page */

interface PageArgs extends CaseArgs {
  scenario: string;
}

const pageArgTypes = {
  ...caseArgTypes,
  scenario: {
    control: 'select',
    options: scenarios.map((item) => item.id),
    labels: Object.fromEntries(scenarios.map((item) => [item.id, item.label])),
  },
};

const OnPostPage = ({ scenario, variant, replies }: PageArgs): ReactElement => {
  const spy = useSignupSpy();
  const current = scenarioById(scenario);
  return (
    <DocPage
      eyebrow="Comments teaser"
      title="On the real post page"
      intro={
        <p>
          Production’s PostContent, logged out, with the comment list swapped
          for the teaser. Each device scrolls on its own and opens at the
          comments. Laptop includes the bottom sign-up bar the page mounts
          today. Scenario, variant and reply rule are in Controls.
        </p>
      }
    >
      <Label title={`${current.label} · ${variantNames[variant]}`}>
        {variantSummaries[variant]}
      </Label>
      <div className="flex flex-col gap-10">
        <Device {...devices.laptopL}>
          <TeaserPostPage
            key={`${scenario}-${variant}-${replies}`}
            scenario={current}
            variant={variant}
            replies={replies}
            stickyBar
            onSignup={spy.onSignup}
            onLogin={spy.onLogin}
          />
          <ScrollToComments offset={120} />
        </Device>
        <div className="flex flex-wrap items-start gap-10">
          <Device {...devices.tablet} fit={false}>
            <TeaserPostPage
              key={`${scenario}-${variant}-${replies}`}
              scenario={current}
              variant={variant}
              replies={replies}
              onSignup={spy.onSignup}
              onLogin={spy.onLogin}
            />
            <ScrollToComments />
          </Device>
          <Device {...devices.phone} fit={false}>
            <TeaserPostPage
              key={`${scenario}-${variant}-${replies}`}
              scenario={current}
              variant={variant}
              replies={replies}
              onSignup={spy.onSignup}
              onLogin={spy.onLogin}
            />
            <ScrollToComments />
          </Device>
        </div>
      </div>
      <SignupToast event={spy.event} />
    </DocPage>
  );
};

export const PostPage: StoryObj<PageArgs> = {
  name: '4. On the post page',
  args: { scenario: 'many', variant: 'bar', replies: 'locked' },
  argTypes: pageArgTypes,
  render: (args) => <OnPostPage {...args} />,
};

/* ------------------------------------------------------ 5. Today vs teaser */

const TodayVsTeaser = ({
  scenario,
  variant,
  replies,
}: PageArgs): ReactElement => {
  const spy = useSignupSpy();
  const current = scenarioById(scenario);
  return (
    <DocPage
      eyebrow="Comments teaser"
      title="Today against the teaser"
      intro={
        <p>
          Same post, same comments, laptop, logged out. Left is production
          today: every comment, the end-of-thread share band, the bottom bar.
          Right is the teaser.
        </p>
      }
    >
      <div className="grid gap-8 laptopL:grid-cols-2">
        {[false, true].map((teaser) => (
          <Device
            key={`${teaser}`}
            {...devices.laptop}
            label={teaser ? `Teaser · ${variantNames[variant]}` : 'Today'}
          >
            <TeaserPostPage
              key={`${scenario}-${variant}-${replies}-${teaser}`}
              scenario={current}
              variant={variant}
              replies={replies}
              teaser={teaser}
              stickyBar
              onSignup={spy.onSignup}
              onLogin={spy.onLogin}
            />
            <ScrollToComments offset={120} />
          </Device>
        ))}
      </div>
      <SignupToast event={spy.event} />
    </DocPage>
  );
};

export const BeforeAfter: StoryObj<PageArgs> = {
  name: '5. Today vs teaser',
  args: { scenario: 'many', variant: 'bar', replies: 'locked' },
  argTypes: pageArgTypes,
  render: (args) => <TodayVsTeaser {...args} />,
};

/* ------------------------------------------------- 6. Skeleton anatomy */

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
            Drawn on the real comment’s geometry so the swap from real to grey
            has no jump: same bordered card, 40px avatar, name · handle · time
            row, the reputation badge row, text, actions. Static, and
            deliberately different from the loading placeholder, which pulses
            square blocks.
          </p>
        }
      >
        <div className="grid gap-8 laptopL:grid-cols-3">
          <Column>
            <Label title="Real comment" />
            <CommentsTeaser
              post={post}
              comments={scenario.comments}
              numComments={1}
              limit={1}
              onSignup={() => undefined}
              className="!mx-0 !mb-0 [&>section]:hidden"
            />
          </Column>
          <Column>
            <Label title="Teaser skeleton (new)" />
            <div className="mt-6">
              <SkeletonComment />
            </div>
          </Column>
          <Column>
            <Label title="Loading placeholder (today, unchanged)" />
            <div className="mt-2">
              <PlaceholderComment />
            </div>
          </Column>
        </div>
      </DocPage>
    );
  },
};
