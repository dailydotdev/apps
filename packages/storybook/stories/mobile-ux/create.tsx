import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { LinkIcon } from '@dailydotdev/shared/src/components/icons/Link';
import { PollIcon } from '@dailydotdev/shared/src/components/icons/Poll';
import { ImageIcon } from '@dailydotdev/shared/src/components/icons/Image';
import { AtIcon } from '@dailydotdev/shared/src/components/icons/At';
import { MarkdownIcon } from '@dailydotdev/shared/src/components/icons/Markdown';
import { CalendarIcon } from '@dailydotdev/shared/src/components/icons/Calendar';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons/Timer';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { Avatar, Dim, FeedList, ProposedHomeHeader } from './mocks';
import { BarMaterial, materials } from './floating';
import { Capsule, Circle, CreateLook, RootCluster, chromeSpec, createLookClassName } from './chrome';
import { Sheet, SheetGroup, SheetRow } from './sheets';
import { posts } from './data';

// The Create flow, drawn from the production composer (SmartComposerModal):
// header = avatar + AudienceChip ("Everyone" or squads) on the left, schedule
// and Markdown buttons and the close X on the right; the kind is switched
// INSIDE the composer with KindModePicker (Free form · Share a link · Poll),
// which sits in the toolbar next to the Post button. Because the kind lives
// inside, the Create button can open the composer directly; the three-row
// sheet becomes an alternative, not the default.

const material = BarMaterial.Glass;

const Frame = ({
  children,
  overlay,
  header,
  bottom,
}: {
  children: ReactNode;
  overlay?: ReactNode;
  header?: ReactNode;
  bottom?: ReactNode;
}): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      {header && <div className="relative z-2 shrink-0">{header}</div>}
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">{children}</div>
      {bottom && !overlay && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">{bottom}</div>
      )}
      {overlay && <div className="absolute inset-0 z-3">{overlay}</div>}
    </div>
  </Phone>
);

export const CreateEntry = (): ReactElement => (
  <Frame header={<ProposedHomeHeader />} bottom={<RootCluster material={material} />}>
    <FeedList />
  </Frame>
);

// ---- Composer, production structure --------------------------------------

type Kind = 'text' | 'link' | 'poll';

const kindMeta: Record<Kind, { label: string; icon: ReactElement }> = {
  text: { label: 'Free form', icon: <EditIcon size={IconSize.XSmall} /> },
  link: { label: 'Share a link', icon: <LinkIcon size={IconSize.XSmall} /> },
  poll: { label: 'Poll', icon: <PollIcon size={IconSize.XSmall} /> },
};

// AudienceChip: avatar stack + "Everyone" or the squad name + chevron.
const AudienceChip = ({ label = 'Everyone' }: { label?: string }): ReactElement => (
  <span className="flex h-8 items-center gap-1.5 rounded-10 border border-border-subtlest-tertiary pl-1 pr-2">
    <span className="flex -space-x-1">
      <span className="flex size-5 items-center justify-center rounded-max bg-accent-water-default text-white ring-2 ring-background-default typo-caption2">
        R
      </span>
      <span className="flex size-5 items-center justify-center rounded-max bg-accent-avocado-default text-white ring-2 ring-background-default typo-caption2">
        A
      </span>
    </span>
    <span className="font-bold typo-caption1">{label}</span>
    <ArrowIcon size={IconSize.XSmall} className="rotate-180 text-text-tertiary" />
  </span>
);

// KindModePicker: the cabbage-outlined chip with the active kind.
const KindPicker = ({ kind }: { kind: Kind }): ReactElement => (
  <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-8 border border-accent-cabbage-default px-2 text-text-primary typo-caption1">
    {kindMeta[kind].icon}
    {kindMeta[kind].label}
    <ArrowIcon size={IconSize.XSmall} className="text-accent-cabbage-default" />
  </span>
);

const PostButton = ({ enabled }: { enabled?: boolean }): ReactElement => (
  <span
    className={classNames(
      'rounded-10 px-5 py-1.5 font-bold typo-footnote',
      enabled ? 'bg-text-primary text-surface-invert' : 'bg-surface-float text-text-quaternary',
    )}
  >
    Post
  </span>
);

const HeaderRow = ({ kind, audience }: { kind: Kind; audience?: string }): ReactElement => (
  <div className="flex items-start justify-between gap-2 px-5 pb-2 pt-5">
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <Avatar size={32} />
      <AudienceChip label={audience} />
    </div>
    <div className="flex shrink-0 items-center gap-1 text-text-secondary">
      <span className="flex size-8 items-center justify-center"><TimerIcon size={IconSize.Small} /></span>
      <span className="flex size-8 items-center justify-center"><CalendarIcon size={IconSize.Small} /></span>
      {kind === 'text' && (
        <span className="flex size-8 items-center justify-center"><MarkdownIcon size={IconSize.Small} /></span>
      )}
      <span className="flex size-8 items-center justify-center text-text-primary"><MiniCloseIcon size={IconSize.Small} /></span>
    </div>
  </div>
);

export const Keyboard = (): ReactElement => (
  <div className="flex h-52 shrink-0 items-center justify-center bg-background-subtle text-text-quaternary typo-caption1">
    keyboard
  </div>
);

const Composer = ({
  kind,
  enabled,
  audience,
  children,
}: {
  kind: Kind;
  enabled?: boolean;
  audience?: string;
  children: ReactNode;
}): ReactElement => (
  <div className="absolute inset-x-0 -top-11 bottom-0 flex flex-col bg-background-default pt-11">
    <HeaderRow kind={kind} audience={audience} />
    <div className="min-h-0 flex-1 overflow-hidden px-5 pt-2">{children}</div>
    {kind === 'text' ? (
      <div className="flex shrink-0 flex-col gap-2 px-5 pb-3">
        <div className="flex items-center gap-1 text-text-secondary">
          <span className="flex size-8 items-center justify-center"><ImageIcon size={IconSize.Small} /></span>
          <span className="flex size-8 items-center justify-center"><LinkIcon size={IconSize.Small} /></span>
          <span className="flex size-8 items-center justify-center"><AtIcon size={IconSize.Small} /></span>
        </div>
        <div className="flex items-center justify-between">
          <KindPicker kind={kind} />
          <PostButton enabled={enabled} />
        </div>
      </div>
    ) : (
      <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-2">
        <KindPicker kind={kind} />
        <PostButton enabled={enabled} />
      </div>
    )}
    <Keyboard />
  </div>
);

const Caret = (): ReactElement => (
  <span className="ml-px inline-block h-5 w-px animate-pulse bg-text-primary align-middle" />
);

export const ComposerText = (): ReactElement => (
  <Composer kind="text" enabled audience="React Israel">
    <div className="flex flex-col gap-2">
      <span className="font-bold leading-tight typo-title2">
        What we learned migrating 300 routes to the App Router
        <Caret />
      </span>
      <span className="text-text-quaternary typo-callout">Share your thoughts…</span>
    </div>
  </Composer>
);

export const ComposerEmpty = (): ReactElement => (
  <Composer kind="text">
    <div className="flex flex-col gap-2">
      <span className="font-bold leading-tight text-text-quaternary typo-title2">
        Post title…
        <Caret />
      </span>
      <span className="text-text-quaternary typo-callout">Share your thoughts…</span>
    </div>
  </Composer>
);

export const ComposerLink = (): ReactElement => (
  <Composer kind="link" enabled audience="React Israel">
    <div className="flex flex-col gap-3">
      <span className="font-bold leading-tight typo-title2">react.dev/blog/2026/09/react-19-3</span>
      <div className="flex gap-3 rounded-12 border border-border-subtlest-tertiary p-3">
        <div className={classNames('h-16 w-24 shrink-0 rounded-8', posts[3].cover)} />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="line-clamp-2 font-bold typo-footnote">React 19.3 – React</span>
          <span className="text-text-tertiary typo-caption1">react.dev · 15m read</span>
        </div>
      </div>
      <span className="text-text-quaternary typo-callout">
        Add a comment (optional)
        <Caret />
      </span>
    </div>
  </Composer>
);

export const ComposerPoll = (): ReactElement => (
  <Composer kind="poll" audience="React Israel">
    <div className="flex flex-col gap-3">
      <span className="font-bold leading-tight typo-title2">
        Which router do you ship with in 2026?
        <Caret />
      </span>
      {['App Router', 'Pages Router', 'Option 3'].map((option, index) => (
        <div
          key={option}
          style={{ borderRadius: chromeSpec.fieldRadius }}
          className={classNames(
            'flex h-11 items-center justify-between border border-border-subtlest-tertiary px-3 typo-callout',
            index === 2 && 'text-text-quaternary',
          )}
        >
          {option}
          {index < 2 && <MiniCloseIcon size={IconSize.XSmall} className="text-text-quaternary" />}
        </div>
      ))}
      <span className="flex items-center gap-2 text-text-tertiary typo-footnote">
        <PlusIcon size={IconSize.Small} />
        Add option
      </span>
      <span className="flex h-8 w-fit items-center gap-1 rounded-8 border border-border-subtlest-tertiary px-2 text-text-secondary typo-caption1">
        Duration: 3 days
        <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
      </span>
    </div>
  </Composer>
);

const wrap = (composer: ReactElement): ReactElement => (
  <Frame header={<ProposedHomeHeader />} overlay={composer}>
    <Dim>
      <FeedList />
    </Dim>
  </Frame>
);


// Commenting uses the same full-page composer as posting (production's
// comment modal is full screen on phones): the post being answered as a
// compact card, the field, the same toolbar and Post button, the keyboard.
export const CommentComposer = ({ onClose }: { onClose?: () => void }): ReactElement => (
  <div className="absolute inset-x-0 -top-11 bottom-0 z-3 flex flex-col bg-background-default pt-11">
    <div className="flex items-center justify-between gap-2 px-5 pb-2 pt-5">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Avatar size={32} />
        <span className="font-bold typo-callout">Comment</span>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-text-secondary">
        <span className="flex size-8 items-center justify-center"><MarkdownIcon size={IconSize.Small} /></span>
        <button type="button" onClick={onClose} className="flex size-8 items-center justify-center text-text-primary" aria-label="Close">
          <MiniCloseIcon size={IconSize.Small} />
        </button>
      </div>
    </div>
    <div className="mx-5 flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-max bg-text-primary font-bold text-surface-invert typo-caption2">
        DEV
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold typo-footnote">It’s not just you, Next.js is getting harder to use</span>
        <span className="text-text-tertiary typo-caption1">DEV · 7m read time</span>
      </div>
    </div>
    <div className="min-h-0 flex-1 overflow-hidden px-5 pt-4">
      <span className="text-text-tertiary typo-body">
        Share your thoughts
        <Caret />
      </span>
    </div>
    <div className="flex shrink-0 items-center justify-between px-5 pb-3">
      <div className="flex items-center gap-1 text-text-secondary">
        <span className="flex size-8 items-center justify-center"><ImageIcon size={IconSize.Small} /></span>
        <span className="flex size-8 items-center justify-center"><LinkIcon size={IconSize.Small} /></span>
        <span className="flex size-8 items-center justify-center"><AtIcon size={IconSize.Small} /></span>
      </div>
      <button type="button" onClick={onClose}>
        <PostButton />
      </button>
    </div>
    <Keyboard />
  </div>
);

export const CommentComposerPhone = (): ReactElement => wrap(<CommentComposer />);

export const ComposerEmptyPhone = (): ReactElement => wrap(<ComposerEmpty />);
export const ComposerTextPhone = (): ReactElement => wrap(<ComposerText />);
export const ComposerLinkPhone = (): ReactElement => wrap(<ComposerLink />);
export const ComposerPollPhone = (): ReactElement => wrap(<ComposerPoll />);

// Kind picker open: the production dropdown above the chip.
export const KindMenuPhone = (): ReactElement =>
  wrap(
    <div className="absolute inset-0">
      <ComposerEmpty />
      <div className="absolute bottom-[17rem] left-5 z-2 flex w-48 flex-col rounded-12 border border-border-subtlest-tertiary bg-background-popover py-1 shadow-3">
        {(Object.keys(kindMeta) as Kind[]).map((key, index) => (
          <span
            key={key}
            className={classNames(
              'flex h-9 items-center gap-2 px-3 typo-footnote',
              index === 0 ? 'font-bold text-text-primary' : 'text-text-secondary',
            )}
          >
            {kindMeta[key].icon}
            {kindMeta[key].label}
          </span>
        ))}
      </div>
    </div>,
  );

// ---- Alternatives ---------------------------------------------------------

// A: the choice sheet (today's drawer on the sheet primitive).
export const CreateChoiceSheet = (): ReactElement => (
  <Sheet title="Create">
    <SheetGroup>
      <SheetRow icon={<EditIcon size={IconSize.Medium} />} label="New post" meta="Write something" chevron />
      <SheetRow icon={<LinkIcon size={IconSize.Medium} />} label="Share a link" meta="Paste a URL" chevron />
      <SheetRow icon={<PollIcon size={IconSize.Medium} />} label="Poll" meta="Ask a question" chevron />
    </SheetGroup>
  </Sheet>
);

export const CreateSheetPhone = (): ReactElement => (
  <Frame header={<ProposedHomeHeader />} overlay={<CreateChoiceSheet />}>
    <Dim>
      <FeedList />
    </Dim>
  </Frame>
);

// B: the bar morphs. Tapping Create turns the tab bar into the three kinds
// and the Create square into a close; tapping a kind opens the composer.
export const MorphCluster = (): ReactElement => (
  <div className="flex items-end" style={{ paddingInline: chromeSpec.inset, gap: chromeSpec.gap }}>
    <Capsule material={material} p={0} className="flex-1" style={{ padding: chromeSpec.padding }}>
      {(Object.keys(kindMeta) as Kind[]).map((key) => (
        <span
          key={key}
          className="flex flex-1 flex-col items-center justify-center gap-1 text-text-primary"
        >
          {React.cloneElement(kindMeta[key].icon, { size: IconSize.Medium })}
          <span style={{ fontSize: 10, lineHeight: '12px', fontWeight: 600 }}>
            {key === 'text' ? 'Post' : key === 'link' ? 'Link' : 'Poll'}
          </span>
        </span>
      ))}
    </Capsule>
    <Circle material={material} p={0} className={createLookClassName[CreateLook.Material]}>
      <MiniCloseIcon size={IconSize.Small} />
    </Circle>
  </div>
);

export const MorphPhone = (): ReactElement => (
  <Frame header={<ProposedHomeHeader />} bottom={<MorphCluster />}>
    <Dim>
      <FeedList />
    </Dim>
  </Frame>
);

// After posting: back where you were, the new post first, a toast.
export const PostedPhone = (): ReactElement => (
  <Frame header={<ProposedHomeHeader active={2} />} bottom={<RootCluster material={material} />}>
    <div className="relative">
      <div
        style={{ ...materials[BarMaterial.Solid], borderRadius: chromeSpec.radius }}
        className="mx-4 mt-3 flex items-center justify-between px-4 py-3 typo-footnote"
      >
        <span className="font-bold">Posted to React Israel</span>
        <span className="font-bold underline">View</span>
      </div>
      <FeedList
        items={[
          {
            ...posts[0],
            title: 'What we learned migrating 300 routes to the App Router',
            source: 'React Israel',
            sourceInitials: 'R',
            sourceTone: 'bg-accent-water-default text-white',
            upvotes: '1',
            comments: 0,
          },
          posts[1],
          posts[2],
        ]}
      />
    </div>
  </Frame>
);
