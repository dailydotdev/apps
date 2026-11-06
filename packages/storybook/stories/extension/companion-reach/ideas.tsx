import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { TopHero } from '@dailydotdev/shared/src/components/marketing/banners/HeroBottomBanner';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ClickableText } from '@dailydotdev/shared/src/components/buttons/ClickableText';
import {
  AppIcon,
  BellIcon,
  BrowserGroupIcon,
  DocsIcon,
  EarthIcon,
  FlagIcon,
  MiniCloseIcon,
  OpenLinkIcon,
  PhoneIcon,
  PlayIcon,
  TerminalIcon,
  UpvoteIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Checkbox } from '@dailydotdev/shared/src/components/fields/Checkbox';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { ProfileSection } from '@dailydotdev/shared/src/components/ProfileMenu/ProfileSection';
import { FeedWidgetTip } from '@dailydotdev/shared/src/features/feedWidgets/widgets/FeedWidgetTip';
import type { FeedWidgetTip as FeedWidgetTipItem } from '@dailydotdev/shared/src/features/feedWidgets/tips';
import {
  HijackingCoverStrip,
  hijackingPrimaryCta,
} from '@dailydotdev/shared/src/components/auth/HijackingCoverStrip';
import { cloudinaryCompanionPreview } from '@dailydotdev/shared/src/lib/image';
import { companionExplainerVideo } from '@dailydotdev/shared/src/lib/constants';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import {
  ActivateButton,
  ArticleMock,
  BrowserPermissionDialog,
  BrowserWindow,
  CompanionPill,
  CompanionPreview,
  Idea,
  NewTabMock,
  Scrim,
  Tier,
  Variant,
  Variants,
  noop,
  railButtonClass,
  usePermission,
} from './kit';

// The ideas, one component each, numbered in the order the Read me ranks
// them. Every Enable button runs the browser's permission round trip, so a
// reviewer sees where each idea leaves the member: on the dialog.

// --- Shared drawings ----------------------------------------------------------

const Toast = ({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    role="status"
    className={classNames(
      'flex max-w-[30rem] items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-popover py-2 pl-4 pr-2 shadow-2',
      className,
    )}
  >
    <span className="min-w-0 flex-1 text-pretty typo-footnote">{children}</span>
    {action}
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-text-tertiary">
      <MiniCloseIcon size={IconSize.Small} />
    </span>
  </div>
);

/** The ask modal, on the recipe of ReaderInstallPromptModal's centred card. */
const AskCard = ({
  title,
  body,
  primary,
  secondary,
  preview,
  footnote,
}: {
  title: string;
  body: string;
  primary: ReactNode;
  secondary?: ReactNode;
  preview?: ReactNode;
  footnote?: ReactNode;
}): ReactElement => (
  <div className="flex w-full max-w-[30rem] flex-col items-center gap-4 rounded-24 bg-background-default p-6 text-center shadow-[0_32px_80px_-16px_rgba(0,0,0,0.55)]">
    {preview}
    <div className="flex flex-col gap-1">
      <h4 className="text-balance font-bold typo-title3">{title}</h4>
      <p className="text-pretty text-text-tertiary typo-callout">{body}</p>
    </div>
    <div className="flex w-full flex-col items-center gap-2">
      {primary}
      {secondary}
    </div>
    {footnote && (
      <p className="text-pretty text-text-quaternary typo-caption1">
        {footnote}
      </p>
    )}
  </div>
);

const permissionFootnote =
  'Your browser will ask to “read and change data on all websites”. The companion only uses it to show up on articles. [Copy to confirm with privacy]';

// --- 1. Ask at the Read moment -------------------------------------------------

const ReadMomentModal = (): ReactElement => {
  const permission = usePermission();
  const [isOpen, setIsOpen] = useState(true);
  return (
    <NewTabMock
      height={520}
      onRead={() => setIsOpen(true)}
      overlay={
        isOpen && (
          <Scrim onClose={() => setIsOpen(false)}>
            <AskCard
              preview={<CompanionPreview />}
              title="Take daily.dev to the article"
              body="See the TLDR, upvote and join the discussion right on the page you’re reading."
              primary={
                <ActivateButton
                  permission={permission}
                  label="Enable companion & read"
                  size={ButtonSize.Large}
                  className="w-full"
                />
              }
              secondary={
                <Button
                  type="button"
                  variant={ButtonVariant.Float}
                  size={ButtonSize.Medium}
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Just open the article
                </Button>
              }
              footnote={permissionFootnote}
            />
            <BrowserPermissionDialog permission={permission} />
          </Scrim>
        )
      }
    />
  );
};

const ReadMomentToast = (): ReactElement => {
  const permission = usePermission();
  return (
    <NewTabMock
      height={520}
      overlay={
        <>
          <div className="absolute bottom-4 left-1/2 z-2 w-[calc(100%-6rem)] -translate-x-1/2">
            <Toast
              action={
                <ActivateButton
                  permission={permission}
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Subtle}
                />
              }
            >
              Opened in a new tab. Next time, upvote and comment right on the
              article.
            </Toast>
          </div>
          <BrowserPermissionDialog permission={permission} />
        </>
      }
    />
  );
};

export const IdeaReadMoment = (): ReactElement => (
  <Idea
    id="read-moment"
    n={1}
    tier={Tier.Bet}
    title="Ask when they click Read on the new tab"
    pitch="The companion is worth something on the article page, so ask on the way there. The first time a member opens an article from the new tab, intercept the click once, show what they would get, and let them go on either way. This is the reader’s own playbook (useReaderInstallPromptGate), pointed at the companion."
    facts={{
      moment: 'First (or Nth) Read click from the new tab feed or post modal',
      surface:
        'A useCompanionPromptGate beside useReaderInstallPromptGate, called from Feed.tsx onReadArticleClick and PostHeaderActions',
      rule: 'New tab is an extension page, so permissions.request works from the click',
      build: 'M',
      origin: 'companion read prompt',
    }}
    open="Nth click or first? The modal costs one article open; the toast costs nothing but is easy to miss. Test both."
  >
    <Variants>
      <Variant
        label="A · One-time modal on the Read click"
        note="Click any Read button to reopen it. Enable runs the browser dialog."
      >
        <ReadMomentModal />
      </Variant>
      <Variant
        label="B · Toast after the article opened"
        note="The new tab stays behind the article; the member sees this when they come back."
      >
        <ReadMomentToast />
      </Variant>
    </Variants>
  </Idea>
);

// --- 2. Reader and companion, one grant ---------------------------------------

const ReaderPrompt = ({
  withCheckbox,
}: {
  withCheckbox: boolean;
}): ReactElement => {
  const permission = usePermission();
  const [alsoCompanion, setAlsoCompanion] = useState(true);
  return (
    <BrowserWindow
      url="app.daily.dev/posts/why-your-react-app-re-renders"
      height={460}
    >
      <ArticleMock />
      <Scrim>
        <AskCard
          title="Read it right here."
          body="Open the article inside daily.dev with the discussion right next to it."
          primary={
            <ActivateButton
              permission={permission}
              label="Enable permissions & read inside"
              size={ButtonSize.Large}
              className="w-full"
            />
          }
          secondary={
            <>
              {withCheckbox && (
                <Checkbox
                  name="also-companion"
                  checked={alsoCompanion}
                  onToggleCallback={setAlsoCompanion}
                  className="self-center"
                >
                  Also show the companion on articles I open elsewhere
                </Checkbox>
              )}
              <Button
                type="button"
                variant={ButtonVariant.Float}
                className="w-full"
              >
                Don’t ask again, open new tab
              </Button>
            </>
          }
        />
      </Scrim>
      <BrowserPermissionDialog permission={permission} />
    </BrowserWindow>
  );
};

export const IdeaReaderBundle = (): ReactElement => (
  <Idea
    id="reader-bundle"
    n={2}
    tier={Tier.Bet}
    title="One grant for the reader and the companion"
    pitch={
      <>
        The reader’s prompt asks the browser for <code>*://*/*</code>, the exact
        origin the companion needs. The background registers the companion
        scripts whenever that origin is granted, so{' '}
        <strong>every reader opt-in probably already has the companion</strong>{' '}
        — and nobody logs it, because only requestContentScripts logs{' '}
        <code>approve content scripts</code>. Make it explicit, and measure it.
      </>
    }
    facts={{
      moment: 'The reader prompt on a post (already shipped)',
      surface:
        'ReaderInstallPromptModal; frameEmbeddingPermissions.ts grants declarativeNetRequestWithHostAccess + *://*/*; background getContentScriptPermissionAndRegister',
      rule: 'Same browser dialog, same sentence. No second ask needed',
      build: 'S',
      origin: 'reader permission',
    }}
    open="Confirm in a real Chrome that a reader grant shows the companion on the next article. If it does, the first job is a log line, not UI."
  >
    <Variants>
      <Variant
        label="Today · the reader prompt"
        note="ReaderInstallPromptModal copy, as shipped."
      >
        <ReaderPrompt withCheckbox={false} />
      </Variant>
      <Variant
        label="Proposed · say what the grant also turns on"
        note="Checked by default. Unchecked sets optOutCompanion, so the grant stays reader-only."
      >
        <ReaderPrompt withCheckbox />
      </Variant>
    </Variants>
  </Idea>
);

// --- 3. The post page asks extension users ------------------------------------

const PostPageAsk = (): ReactElement => {
  const permission = usePermission();
  return (
    <BrowserWindow
      url="app.daily.dev/posts/why-your-react-app-re-renders"
      height={400}
    >
      <ArticleMock title="Why your React app re-renders more than you think" />
      <div className="absolute right-0 top-6 flex flex-row items-start">
        <div className="mt-2 flex w-72 flex-col gap-1 rounded-l-16 border border-r-0 border-border-subtlest-quaternary bg-background-default p-5 shadow-2">
          <div className="flex items-center gap-2">
            <LogoIcon className={{ container: 'w-7 rounded-8' }} />
            <span className="ml-auto text-text-quaternary">
              <MiniCloseIcon size={IconSize.Small} />
            </span>
          </div>
          <span className="mt-3 text-balance font-bold typo-title3">
            You have the extension. Turn this on.
          </span>
          <span className="text-pretty text-text-tertiary typo-callout">
            The TLDR, votes and discussion, on every article you open across the
            web.
          </span>
          <ActivateButton
            permission={permission}
            size={ButtonSize.Medium}
            className="mt-4 w-full"
          />
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            className="w-full"
          >
            Not now
          </Button>
        </div>
        <CompanionPill className="!static" />
      </div>
      <BrowserPermissionDialog permission={permission} />
    </BrowserWindow>
  );
};

export const IdeaPostPage = (): ReactElement => (
  <Idea
    id="post-page"
    n={3}
    tier={Tier.Bet}
    title="Let the post page’s demo pill ask extension users too"
    pitch={
      <>
        <code>companion_demo_widget</code> already draws the companion pill on
        app.daily.dev post pages — but only for people without the extension,
        and it ends on “Install”. The members we want are the other half: the
        extension is installed, the permission is not. Same pill, same place,
        ending on Enable. The page can trigger the browser dialog through the
        ping relay the reader already uses.
      </>
    }
    facts={{
      moment: 'Reading a post on app.daily.dev with the extension installed',
      surface:
        'CompanionDemoWidget (webapp posts/[id]); a RequestContentScripts relay in ping/index.ts + background, next to RequestFrameEmbeddingPermissions',
      rule: 'Webapp pages cannot call permissions.request; the relay keeps the click’s user gesture, as the reader’s does',
      build: 'M',
      origin: 'companion post page',
    }}
    open="The demo widget is gated on lastExtensionUse being empty. This arm needs the opposite gate plus a way for the page to know the permission is missing (the ping script can answer)."
  >
    <PostPageAsk />
  </Idea>
);

// --- 4. A tip, and the hero cover ----------------------------------------------

const companionTip: FeedWidgetTipItem = {
  id: 'companion',
  eyebrow: 'Companion',
  title: 'Upvote and comment on any article',
  description:
    'Turn on the companion and the TLDR, votes and discussion follow you to the article page.',
  href: '#',
  icon: AppIcon,
  tone: 'cabbage',
};

const CoverAsk = (): ReactElement => {
  const permission = usePermission();
  return (
    <div className="relative">
      <HijackingCoverStrip
        copy={{
          heading: 'Take daily.dev with you',
          body: 'The companion brings the TLDR and the discussion to every article you open.',
        }}
        actions={
          <>
            <ActivateButton
              permission={permission}
              size={ButtonSize.Medium}
              className={hijackingPrimaryCta}
            />
            <Button
              tag="a"
              href={companionExplainerVideo}
              target="_blank"
              variant={ButtonVariant.Float}
              size={ButtonSize.Medium}
              icon={<PlayIcon />}
            >
              Watch 30s
            </Button>
          </>
        }
      />
      <BrowserPermissionDialog permission={permission} />
    </div>
  );
};

export const IdeaTips = (): ReactElement => (
  <Idea
    id="tips"
    n={4}
    tier={Tier.Test}
    title="A companion tip, and a slot on the hero cover"
    pitch="You said the tips should replace the widgets. There is no companion tip yet — add one to feedWidgetTips — and give the hero cover a companion message for members who are past onboarding."
    facts={{
      moment: 'Any new tab view, one random tip per view',
      surface:
        'features/feedWidgets/tips.ts (new entry) + FeedWidgetTip; HijackingCoverStrip copy for signed-in members',
      rule: 'A tip is a link today; this one needs an onClick that calls requestContentScripts, extension only',
      build: 'S',
      origin: 'companion tip / companion cover',
    }}
    open="Tips are random per view, so reach is diluted by the number of tips. Pin the companion tip until it is closed or granted?"
  >
    <Variants>
      <Variant
        label="A · FeedWidgetTip with a new companion entry"
        note="The real component; hover shows “All tips”."
      >
        <div className="max-w-[22rem]">
          <FeedWidgetTip tip={companionTip} isEditing={false} />
        </div>
      </Variant>
      <Variant
        label="B · The hero cover, signed in"
        note="HijackingCoverStrip, the real component, with companion copy."
      >
        <CoverAsk />
      </Variant>
    </Variants>
  </Idea>
);

// --- 5. Onboarding ------------------------------------------------------------

const OnboardingStep = (): ReactElement => {
  const permission = usePermission();
  return (
    <BrowserWindow url="app.daily.dev/activate" height={500}>
      <div className="flex h-full flex-col items-center gap-3 overflow-hidden px-8 py-8 text-center">
        <span className="rounded-8 bg-accent-avocado-flat px-2 py-0.5 font-bold text-accent-avocado-default typo-caption1">
          <VIcon size={IconSize.XSmall} className="mr-1 inline" />
          New tab activated
        </span>
        <h4 className="text-balance font-bold typo-large-title">
          One more thing: daily.dev on every article
        </h4>
        <p className="text-text-secondary typo-title3">
          Tap “Allow” on the Chrome popup.
        </p>
        <div className="w-full max-w-[28rem]">
          <CompanionPreview height={170} />
        </div>
        <ActivateButton
          permission={permission}
          label="Turn on the companion"
          size={ButtonSize.XLarge}
        />
        <ClickableText className="text-text-tertiary">
          Skip for now
        </ClickableText>
      </div>
      <BrowserPermissionDialog permission={permission} />
    </BrowserWindow>
  );
};

export const IdeaOnboarding = (): ReactElement => (
  <Idea
    id="onboarding"
    n={5}
    tier={Tier.Test}
    title="One optional step right after “Open new tab”"
    pitch="Right after install is when people say yes to things. NewTabActivationPrimer ends on “Open new tab”; add one skippable step after it, on the same page recipe: large title, one instruction, a looping preview, one button."
    facts={{
      moment: 'Install day, after the new-tab activation primer',
      surface:
        'webapp pages/activate.tsx → NewTabActivationPrimer onComplete; or the extension’s first new tab',
      rule: '/activate is a webapp page: it needs the ping relay (as the primer’s requestOpenNewTabFromPage does), or the step moves to the first new tab',
      build: 'M',
      origin: 'companion onboarding',
    }}
    open="Two browser dialogs in the first minute (Keep it, then Allow) may cost activations. Guard it with the activation rate."
  >
    <OnboardingStep />
  </Idea>
);

// --- 6. The card, later and personal -----------------------------------------

const LaterCard = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}): ReactElement => {
  const permission = usePermission();
  return (
    <div className="relative">
      <TopHero
        title={title}
        subtitle={subtitle}
        onClose={noop}
        illustration={
          <span className="!m-0 relative flex h-24 w-32 shrink-0 items-center justify-center self-center">
            <img
              src={cloudinaryCompanionPreview}
              alt=""
              className="h-full w-full rounded-10 object-cover"
            />
            <PlayIcon secondary className="absolute" size={IconSize.XLarge} />
          </span>
        }
        actions={<ActivateButton permission={permission} />}
      />
      <BrowserPermissionDialog permission={permission} />
    </div>
  );
};

const TriggerChip = ({ children }: { children: ReactNode }) => (
  <span className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 text-text-tertiary typo-caption1">
    {children}
  </span>
);

export const IdeaLaterCard = (): ReactElement => (
  <Idea
    id="later-card"
    n={6}
    tier={Tier.Test}
    title="Keep the #7043 card, but show it later and make it personal"
    pitch="A card on day one competes with shortcuts and the cover, and speaks about a feature the member has no reason to want yet. Wait for a signal that they read through the new tab, then say it in their numbers."
    facts={{
      moment: 'After a usage signal: 5+ Read clicks, or day 3 after install',
      surface:
        'ExtensionTopBanners useCompanionOnboarding (shouldShow gains the signal); copy only',
      rule: 'Extension page, permissions.request from the click',
      build: 'S',
      origin: 'companion permission card',
    }}
  >
    <div className="flex flex-wrap gap-2">
      <TriggerChip>Shown after 5 Read clicks</TriggerChip>
      <TriggerChip>or on day 3</TriggerChip>
      <TriggerChip>Gone once closed or granted</TriggerChip>
    </div>
    <Variants cols={3}>
      <Variant label="A · Shipped copy">
        <LaterCard
          title="Try the new companion feature!"
          subtitle="We'll ask for extra permissions so we can show the companion directly on the original content!"
        />
      </Variant>
      <Variant label="B · Their numbers">
        <LaterCard
          title="You opened 12 articles from here this week"
          subtitle="Read them with the TLDR and the discussion beside you."
        />
      </Variant>
      <Variant label="C · The benefit, not the feature">
        <LaterCard
          title="daily.dev, on the article page"
          subtitle="Upvote, comment and save without coming back to this tab."
        />
      </Variant>
    </Variants>
  </Idea>
);

// --- 7. A labelled button ------------------------------------------------------

const PulseDot = () => (
  <span className="absolute right-1 top-1 flex size-2">
    <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-cabbage-default" />
    <span className="relative inline-flex size-2 rounded-full bg-accent-cabbage-default" />
  </span>
);

const ButtonPopover = ({
  permission,
}: {
  permission: ReturnType<typeof usePermission>;
}): ReactElement => (
  <div className="flex w-72 flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4 shadow-2">
    <CompanionPreview height={110} />
    <span className="font-bold typo-callout">The companion</span>
    <span className="text-pretty text-text-tertiary typo-footnote">
      The TLDR, votes and discussion on every article you open.
    </span>
    <ActivateButton permission={permission} className="mt-1" />
  </div>
);

const HeaderButton = (): ReactElement => {
  const permission = usePermission();
  const [isOpen, setIsOpen] = useState(true);
  return (
    <NewTabMock
      height={460}
      headerRight={
        <div className="relative">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            icon={<AppIcon />}
            className="relative !h-8 !rounded-10 !px-3"
            onClick={() => setIsOpen((open) => !open)}
          >
            Companion
            {permission.state !== 'granted' && <PulseDot />}
          </Button>
          {isOpen && (
            <div className="absolute right-0 top-10 z-2">
              <ButtonPopover permission={permission} />
            </div>
          )}
        </div>
      }
      overlay={<BrowserPermissionDialog permission={permission} />}
    />
  );
};

const RailButton = (): ReactElement => {
  const permission = usePermission();
  const [isOpen, setIsOpen] = useState(true);
  return (
    <NewTabMock
      height={460}
      railExtra={
        <button
          type="button"
          aria-label="Companion"
          onClick={() => setIsOpen((open) => !open)}
          className={classNames(railButtonClass, 'relative')}
        >
          <AppIcon size={IconSize.Small} />
          {permission.state !== 'granted' && <PulseDot />}
        </button>
      }
      overlay={
        <>
          {isOpen && (
            <div className="absolute bottom-24 left-16 z-2">
              <ButtonPopover permission={permission} />
            </div>
          )}
          <BrowserPermissionDialog permission={permission} />
        </>
      }
    />
  );
};

export const IdeaLabelledButton = (): ReactElement => (
  <Idea
    id="labelled-button"
    n={7}
    tier={Tier.Test}
    title="Bring back the header placement, with a label"
    pitch={
      <>
        The placement was A/B tested in 2022 (#982) and the header is what
        stayed: <code>ExperimentWinner.CompanionPermissionPlacement</code> is
        still <code>&apos;header&apos;</code>. Layout v2 removed the v1 header,
        which is how the button became an unlabelled square. Put it back where
        the winner was, with a word on it and a one-time pulse. Click a button
        to toggle its popover.
      </>
    }
    facts={{
      moment:
        'Always visible until granted; the pulse stops after the first open',
      surface:
        'MainFeedLayout SearchControlHeader right group (beside IntroQuestButton), or SidebarDesktopV2 “Sidebar utilities”',
      rule: 'Extension page, permissions.request from the click',
      build: 'S',
      origin: 'companion header button',
    }}
    open="The feed header only exists on feed routes; the rail is everywhere but icon-only. Which wins is the test."
  >
    <Variants>
      <Variant label="A · Labelled button in the feed header">
        <HeaderButton />
      </Variant>
      <Variant label="B · Rail utilities, above Support">
        <RailButton />
      </Variant>
    </Variants>
  </Idea>
);

// --- 8. The post modal --------------------------------------------------------

const PostModalHeader = ({ split }: { split: boolean }): ReactElement => {
  const permission = usePermission();
  return (
    <div className="relative flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Medium}
          icon={<OpenLinkIcon />}
        >
          Read post
        </Button>
        {split && (
          <ActivateButton
            permission={permission}
            label="Read with companion"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Float}
          />
        )}
        <span className="ml-auto flex gap-1 text-text-quaternary">
          <MiniCloseIcon size={IconSize.Medium} />
        </span>
      </div>
      {!split && (
        <span className="flex flex-wrap items-center gap-2 text-text-tertiary typo-footnote">
          <EarthIcon size={IconSize.XSmall} />
          Get this on the article page too.
          <ActivateButton
            permission={permission}
            label="Enable companion"
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Subtle}
          />
        </span>
      )}
      <h4 className="font-bold typo-title3">
        Why your React app re-renders more than you think
      </h4>
      <div className="h-20 rounded-12 bg-surface-float" />
      <BrowserPermissionDialog permission={permission} />
    </div>
  );
};

export const IdeaPostModal = (): ReactElement => (
  <Idea
    id="post-modal"
    n={8}
    tier={Tier.Test}
    title="Next to “Read post” in the post modal"
    pitch="The post modal is where a member decides to go to the article. A quiet line under the Read button, or a second button beside it, ties the ask to that exact decision without stopping them."
    facts={{
      moment: 'Post modal opened from the new tab feed',
      surface: 'PostHeaderActions (extension only, permission missing)',
      rule: 'Extension page, permissions.request from the click',
      build: 'S',
      origin: 'companion post modal',
    }}
  >
    <Variants>
      <Variant label="A · A line under the actions">
        <PostModalHeader split={false} />
      </Variant>
      <Variant label="B · A second Read button">
        <PostModalHeader split />
      </Variant>
    </Variants>
  </Idea>
);

// --- 9. The toolbar icon --------------------------------------------------------

const ToolbarTry = (): ReactElement => {
  const permission = usePermission();
  const [tried, setTried] = useState(false);
  return (
    <BrowserWindow url="frontendweekly.dev/react-re-renders" height={400}>
      <ArticleMock>
        {tried && <CompanionPill open className="top-14" />}
      </ArticleMock>
      <div className="absolute right-3 top-2 z-2 flex flex-col items-end gap-2">
        {!tried ? (
          <div className="flex w-64 flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-popover p-3 shadow-2">
            <span className="font-bold typo-footnote">
              ↑ The member clicked the daily.dev icon in the toolbar
            </span>
            <span className="text-text-tertiary typo-caption1">
              Today that opens a new tab. With activeTab it can show the
              companion on this page, this once, with no browser warning.
            </span>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              onClick={() => setTried(true)}
            >
              Show it on this page
            </Button>
          </div>
        ) : (
          <div className="mt-[17rem] flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-popover p-2 pl-3 shadow-2">
            <span className="typo-caption1">Keep it on every article?</span>
            <ActivateButton
              permission={permission}
              label="Always on"
              size={ButtonSize.XSmall}
            />
          </div>
        )}
      </div>
      <BrowserPermissionDialog permission={permission} />
    </BrowserWindow>
  );
};

export const IdeaToolbar = (): ReactElement => (
  <Idea
    id="toolbar"
    n={9}
    tier={Tier.Support}
    title="Try it once from the toolbar icon, then keep it"
    pitch="The one place the companion can appear without the scary dialog: activeTab gives the extension the current tab for one click, with no install warning. Try first, ask second — the ask then follows a page that already shows the companion working."
    facts={{
      moment: 'Clicking the daily.dev toolbar icon on any page',
      surface:
        'manifest (add activeTab; scripting is there); background action.onClicked (today opens index.html?source=button)',
      rule: 'activeTab + scripting.executeScript for the one tab; the “Always on” click still needs the full ask',
      build: 'L',
      origin: 'companion toolbar',
    }}
    open="The toolbar click opening a new tab is a habit for some members. Only take it over on pages that are daily.dev posts?"
  >
    <ToolbarTry />
  </Idea>
);

// --- 10. A setting ------------------------------------------------------------

const SettingRow = (): ReactElement => {
  const permission = usePermission();
  const isOn = permission.state === 'granted';
  return (
    <div className="relative flex max-w-[34rem] flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-5">
      <span className="font-bold typo-callout">Customize</span>
      <div className="flex items-start justify-between gap-4">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="typo-callout">Show the companion on articles</span>
          <span className="text-pretty text-text-tertiary typo-footnote">
            The TLDR, votes and discussion on the article page.
          </span>
        </span>
        <Switch
          inputId="companion-setting"
          name="companion-setting"
          checked={isOn}
          onToggle={isOn ? permission.reset : permission.ask}
          compact={false}
        />
      </div>
      <div className="flex items-start justify-between gap-4 opacity-50">
        <span className="typo-callout">Show shortcuts</span>
        <Switch inputId="s2" name="s2" checked onToggle={noop} />
      </div>
      <BrowserPermissionDialog permission={permission} />
    </div>
  );
};

export const IdeaSetting = (): ReactElement => (
  <Idea
    id="setting"
    n={10}
    tier={Tier.Support}
    title="A switch where people look for switches"
    pitch="Members who want it look in settings, not in Support. A switch beside the other new-tab toggles is the honest home for it, and doubles as the off switch (optOutCompanion) for people who granted it."
    facts={{
      moment: 'Whenever the member opens Customize or settings',
      surface:
        'The new tab Customize panel / settings page, next to the shortcuts toggle',
      rule: 'Extension page; turning it on runs the ask, off sets optOutCompanion',
      build: 'S',
      origin: 'companion setting',
    }}
  >
    <SettingRow />
  </Idea>
);

// --- 11. After an upvote -----------------------------------------------------

const EchoToast = (): ReactElement => {
  const permission = usePermission();
  return (
    <div className="relative flex flex-col gap-3">
      <Toast
        action={
          <ActivateButton
            permission={permission}
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Subtle}
          />
        }
      >
        <UpvoteIcon size={IconSize.XSmall} className="mr-1 inline" />
        Upvoted. Next time, do it right on the article.
      </Toast>
      <BrowserPermissionDialog permission={permission} className="top-16" />
    </div>
  );
};

export const IdeaEcho = (): ReactElement => (
  <Idea
    id="echo"
    n={11}
    tier={Tier.Support}
    title="Echo the action they just took"
    pitch="Someone who upvotes or bookmarks from the new tab has just shown they use the exact actions the companion carries. Say so in the toast that already confirms the action."
    facts={{
      moment: 'First upvote or bookmark from the new tab, once',
      surface:
        'The existing action toast (useToastNotification) with an action button',
      rule: 'Extension page, permissions.request from the toast click',
      build: 'S',
      origin: 'companion action toast',
    }}
  >
    <EchoToast />
  </Idea>
);

// --- 12. What's new -----------------------------------------------------------

export const IdeaWhatsNew = (): ReactElement => (
  <Idea
    id="whats-new"
    n={12}
    tier={Tier.Support}
    title="Tell existing members once"
    pitch="Most extension members installed before the companion was good. One in-app notification and a changelog post reach them where they already look, and both land on a page that can ask."
    facts={{
      moment: 'Once, for extension members without the permission',
      surface:
        'In-app notification (API side) and the changelog squad; both link to a new tab that opens the ask',
      rule: 'The notification links to the new tab; the ask happens there',
      build: 'S',
      origin: 'companion notification',
    }}
  >
    <div className="flex max-w-[26rem] items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-accent-cabbage-flat text-accent-cabbage-default">
        <BellIcon />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-bold typo-callout">
          New: daily.dev on every article
        </span>
        <span className="text-pretty text-text-tertiary typo-footnote">
          See the TLDR and the discussion without leaving the page. One click to
          turn it on.
        </span>
        <span className="text-text-quaternary typo-caption1">2m</span>
      </span>
    </div>
  </Idea>
);

// --- 13. The way back (shipped) ----------------------------------------------

export const IdeaSupportRow = (): ReactElement => (
  <Idea
    id="support-row"
    n={13}
    tier={Tier.Shipped}
    title="The Support menu row stays as the way back"
    pitch="Ido is right that nobody discovers a feature here. It is not meant to be the entry point — it is where someone who closed the card can find it again, and it replaced the unflagged square like for like."
    facts={{
      moment: 'Any time, until granted',
      surface: 'SidebarDesktopV2 useEnableCompanionItem (not behind the flag)',
      rule: 'Extension page',
      build: 'S',
      origin: 'companion support menu',
    }}
  >
    <div className="flex w-64 flex-col gap-2 rounded-10 border border-border-subtlest-tertiary bg-accent-pepper-subtlest p-3">
      <ProfileSection
        linkIconHoverOnly
        items={[
          { title: 'Enable the companion', icon: AppIcon, onClick: noop },
          {
            title: 'Get the mobile app',
            icon: PhoneIcon,
            href: '#',
            external: true,
          },
          {
            title: 'Get the browser extension',
            icon: BrowserGroupIcon,
            href: '#',
            external: true,
          },
          { title: 'Changelog', icon: TerminalIcon, href: '#' },
          { title: 'Docs', icon: DocsIcon, href: '#', external: true },
          { title: 'Report a bug', icon: FlagIcon, href: '#', external: true },
        ]}
      />
    </div>
  </Idea>
);
