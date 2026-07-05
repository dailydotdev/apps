import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { EmojiPicker } from '../fields/EmojiPicker';
import { PlusIcon } from '../icons';
import { IconSize } from '../Icon';
import { LIVE_ROOM_QUICK_REACTION_EMOJIS } from '../../lib/liveRoom/reactions';

interface LiveRoomReactionsToolbarProps {
  isBusy: (key: string) => boolean;
  isAuthenticated: boolean;
  onRequestLogin: () => void;
  onSendReaction: (key: string, emoji: string) => void;
}

export const LiveRoomReactionsToolbar = ({
  isBusy,
  isAuthenticated,
  onRequestLogin,
  onSendReaction,
}: LiveRoomReactionsToolbarProps): ReactElement => (
  <div className="flex items-center gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-default p-1.5 shadow-2">
    {LIVE_ROOM_QUICK_REACTION_EMOJIS.map((emoji) => (
      <Button
        key={emoji}
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Float}
        loading={isBusy(`reaction-${emoji}`)}
        aria-label={`React ${emoji}`}
        onClick={() => onSendReaction(`reaction-${emoji}`, emoji)}
      >
        <span className="text-lg leading-none">{emoji}</span>
      </Button>
    ))}
    <EmojiPicker
      value=""
      label={null}
      onChange={(emoji) => {
        if (!emoji) {
          return;
        }

        onSendReaction('reaction-custom', emoji);
      }}
      renderTrigger={({ isOpen, toggleOpen }) => (
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={isOpen ? ButtonVariant.Primary : ButtonVariant.Float}
          className="!w-9 shrink-0"
          icon={<PlusIcon size={IconSize.Size16} />}
          aria-label="Custom reaction"
          aria-expanded={isOpen}
          disabled={isBusy('reaction-custom')}
          onClick={() => {
            if (!isAuthenticated) {
              onRequestLogin();
              return;
            }

            toggleOpen();
          }}
        />
      )}
    />
  </div>
);
