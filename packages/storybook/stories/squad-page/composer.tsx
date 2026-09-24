import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  LinkIcon,
  MaximizeIcon,
  MiniCloseIcon,
  PlusIcon,
  PollIcon,
  TimerIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { RootPortal } from '@dailydotdev/shared/src/components/tooltips/Portal';
import { AudienceChip } from '@dailydotdev/shared/src/components/post/composer/AudienceChip';
import { KindModePicker } from '@dailydotdev/shared/src/components/post/composer/KindModePicker';
import type { ComposerKind } from '@dailydotdev/shared/src/components/post/composer/types';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { squad, team } from './data';
import { Avatar } from './kit';

// The squad's way into the new composer. The bar is production's
// watercooler shell and prompt; under it sit the composer's own kinds,
// named as the composer names them, so each one opens the composer
// already set to that kind with this squad as the audience.

const kinds: { kind: ComposerKind; label: string; icon: ReactElement }[] = [
  { kind: 'link', label: 'Share a link', icon: <LinkIcon /> },
  { kind: 'poll', label: 'Poll', icon: <PollIcon /> },
];

const audience = {
  id: squad.handle,
  name: squad.name,
  handle: squad.handle,
  image: squad.image,
  permalink: `https://app.daily.dev/squads/${squad.handle}`,
} as unknown as Squad;

const me = team[2];

const titleClass =
  'w-full resize-none bg-transparent font-bold leading-tight text-text-primary outline-none typo-title2 placeholder:text-text-quaternary';
const bodyClass =
  'w-full resize-none bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary';

const ComposerBody = ({
  kind,
  onReady,
}: {
  kind: ComposerKind;
  onReady: (ready: boolean) => void;
}): ReactElement => {
  const [first, setFirst] = useState('');
  const [options, setOptions] = useState(['', '']);

  useEffect(() => {
    onReady(
      kind === 'poll'
        ? !!first.trim() && options.filter((o) => o.trim()).length >= 2
        : !!first.trim(),
    );
  }, [first, kind, onReady, options]);

  if (kind === 'poll') {
    return (
      <div className="flex flex-col gap-4">
        <textarea
          autoFocus
          rows={1}
          value={first}
          onChange={(event) => setFirst(event.target.value)}
          placeholder="Ask a question…"
          aria-label="Poll question"
          className={titleClass}
        />
        <div className="flex flex-col gap-2">
          {options.map((option, index) => (
            <input
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              value={option}
              onChange={(event) =>
                setOptions((list) =>
                  list.map((entry, at) =>
                    at === index ? event.target.value : entry,
                  ),
                )
              }
              placeholder={`Option ${index + 1}`}
              aria-label={`Poll option ${index + 1}`}
              className="rounded-12 border border-border-subtlest-tertiary bg-transparent px-3 py-2.5 text-text-primary outline-none typo-callout placeholder:text-text-quaternary focus:border-border-subtlest-primary"
            />
          ))}
          {options.length < 4 && (
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              className="self-start"
              onClick={() => setOptions((list) => [...list, ''])}
            >
              Add option
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        autoFocus
        rows={1}
        value={first}
        onChange={(event) => setFirst(event.target.value)}
        placeholder={kind === 'link' ? 'Paste a link…' : 'Post title…'}
        aria-label={kind === 'link' ? 'Link URL' : 'Post title'}
        className={titleClass}
      />
      <textarea
        rows={kind === 'link' ? 2 : 5}
        placeholder={
          kind === 'link' ? 'Add a comment (optional)' : 'Share your thoughts'
        }
        aria-label={kind === 'link' ? 'Post commentary' : 'Post body'}
        className={bodyClass}
      />
    </div>
  );
};

/** The new composer as it opens from the squad: this squad preselected. */
export const ComposerPreview = ({
  kind: initialKind,
  onClose,
}: {
  kind: ComposerKind;
  onClose: () => void;
}): ReactElement => {
  const [kind, setKind] = useState(initialKind);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <RootPortal>
      <div
        role="presentation"
        onClick={onClose}
        className="fixed inset-0 z-modal flex items-start justify-center bg-overlay-quaternary-onion px-4 pt-[12vh]"
      >
        <div
          role="dialog"
          aria-label="New post"
          onClick={(event) => event.stopPropagation()}
          className="flex w-full max-w-[40rem] flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-2"
        >
          <div className="flex items-center justify-between gap-2 px-5 pb-2 pt-5">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Avatar member={me} size={2} />
              <AudienceChip
                audiences={[audience]}
                selectedIds={[squad.handle]}
                onChange={() => undefined}
                userAudienceId={undefined}
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<MaximizeIcon />}
                aria-label="Expand composer"
              />
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<MiniCloseIcon />}
                aria-label="Close"
                onClick={onClose}
              />
            </div>
          </div>
          <div className="px-5 pb-3 pt-3">
            <ComposerBody key={kind} kind={kind} onReady={setReady} />
          </div>
          <div className="flex items-center justify-between gap-3 px-5 pb-5 pt-4">
            <KindModePicker value={kind} onChange={setKind} />
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              disabled={!ready}
              onClick={onClose}
              className="px-5"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </RootPortal>
  );
};

/**
 * The bar on the squad. The whole box opens the composer in free form,
 * its default; the shortcuts under the prompt open the other kinds.
 */
export const ComposerEntry = ({
  canPoll,
  reviewed,
}: {
  canPoll: boolean;
  reviewed?: boolean;
}): ReactElement => {
  const [open, setOpen] = useState<ComposerKind | null>(null);
  const shown = kinds.filter(({ kind }) => canPoll || kind !== 'poll');

  return (
    <>
      <div
        role="presentation"
        onClick={() => setOpen('text')}
        className="flex cursor-text flex-col border-b border-border-subtlest-tertiary bg-surface-float tablet:rounded-16 tablet:border transition-colors focus-within:border-border-subtlest-secondary hover:border-border-subtlest-secondary"
      >
        <button
          type="button"
          className="flex items-center gap-3 px-4 pb-2 pt-3 text-left"
        >
          <Avatar member={me} size={2} />
          <span className="min-w-0 flex-1 truncate text-text-quaternary typo-body">
            What&apos;s on your mind?
          </span>
        </button>
        <div className="flex items-center gap-1 px-3 pb-2 tablet:pl-[3.75rem]">
          {shown.map(({ kind, label, icon }) => (
            <Button
              key={kind}
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={React.cloneElement(icon, { size: IconSize.Size16 })}
              onClick={(event: React.MouseEvent) => {
                event.stopPropagation();
                setOpen(kind);
              }}
              className="!px-2 text-text-tertiary"
            >
              {label}
            </Button>
          ))}
          {reviewed && (
            <span
              title="Posts are reviewed by a moderator before they go live."
              className="ml-auto hidden items-center gap-1.5 pr-1 text-text-quaternary typo-caption1 tablet:flex"
            >
              <TimerIcon size={IconSize.Size16} />
              Reviewed before it goes live
            </span>
          )}
        </div>
      </div>
      {open && <ComposerPreview kind={open} onClose={() => setOpen(null)} />}
    </>
  );
};
