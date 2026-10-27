import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { EmojiPicker } from '../../../components/fields/EmojiPicker';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import type { DmReactions } from '../types';

export const AddReactionButton = ({
  onReact,
  className,
}: {
  onReact: (emoji: string) => void;
  className?: string;
}): ReactElement => (
  <EmojiPicker
    value=""
    label={null}
    className="shrink-0"
    onChange={onReact}
    renderTrigger={({ isOpen, toggleOpen }) => (
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        aria-label="Add reaction"
        aria-expanded={isOpen}
        // Stays put while the picker is open, or it would vanish once the
        // pointer leaves the message for the picker.
        className={classNames(!isOpen && className)}
        onClick={toggleOpen}
      >
        <span className="text-base leading-none">🙂</span>
      </Button>
    )}
  />
);

const describeReactors = (
  userIds: string[],
  viewerId: string,
  usernameOf: (id: string) => string | undefined,
): string => {
  const names = userIds.map((id) =>
    id === viewerId ? 'You' : `@${usernameOf(id) ?? 'someone'}`,
  );
  if (names.length <= 2) {
    return names.join(' and ');
  }

  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};

export const MessageReactions = ({
  reactions,
  viewerId,
  peerUsername,
  usernames,
  onToggle,
}: {
  reactions: DmReactions;
  viewerId: string;
  // A direct message has one other party...
  peerUsername?: string;
  // ...a room has many, by user id.
  usernames?: Record<string, string>;
  // Missing when the viewer can't message the peer, so chips are read-only.
  onToggle?: (emoji: string) => void;
}): ReactElement => (
  <div className="flex flex-wrap gap-1">
    {Object.entries(reactions).map(([emoji, userIds]) => {
      const isMine = userIds.includes(viewerId);
      const label = `${describeReactors(
        userIds,
        viewerId,
        (id) => usernames?.[id] ?? peerUsername,
      )} reacted with ${emoji}`;

      return (
        <Tooltip key={emoji} content={label}>
          <button
            type="button"
            aria-label={label}
            aria-pressed={isMine}
            // Not `disabled`: a disabled button gets no pointer events, so the
            // tooltip saying who reacted would never open.
            aria-disabled={!onToggle}
            onClick={() => onToggle?.(emoji)}
            className={classNames(
              'flex h-6 items-center gap-1 rounded-12 border px-2 typo-caption1',
              isMine
                ? 'border-accent-cabbage-default bg-surface-float text-text-primary'
                : 'border-border-subtlest-tertiary text-text-tertiary',
              onToggle ? 'hover:bg-surface-hover' : 'cursor-default',
            )}
          >
            <span className="text-sm leading-none">{emoji}</span>
            {userIds.length > 1 && <span>{userIds.length}</span>}
          </button>
        </Tooltip>
      );
    })}
  </div>
);
