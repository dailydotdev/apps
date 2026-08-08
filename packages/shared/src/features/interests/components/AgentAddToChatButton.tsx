import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { AtIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { AgentAttachment } from '../chat';
import { useAgent } from '../AgentContext';

/**
 * Where the button sits on a card or a row: straddling the top edge at the
 * right, the way Slack hangs its message actions, so it reads as something
 * belonging to the thing under it without taking any of its room. The same
 * place at every width — a control that moves between devices is a second
 * control to learn.
 */
export const addToChatFloat = 'absolute -top-3 right-3 z-1';

/**
 * Hangs off anything the agent has put on screen. Pressing it drops a chip in
 * the composer and puts the caret in the field, so the next thing typed is
 * already about this.
 *
 * It says what it does rather than showing a bare glyph: this is not a control
 * anyone arrives already knowing, and it is the only way most of the workspace
 * gets into a prompt.
 */
export const AgentAddToChatButton = ({
  attachment,
  iconOnly,
  reveal,
  size = ButtonSize.XSmall,
  className,
  onMouseDown,
  onAttached,
}: {
  attachment: AgentAttachment;
  /** For toolbars, where it sits among other icon buttons. */
  iconOnly?: boolean;
  /** Kept out of the way until the pointer is on the thing it belongs to. */
  reveal?: boolean;
  size?: ButtonSize;
  className?: string;
  onMouseDown?: (event: React.MouseEvent) => void;
  onAttached?: () => void;
}): ReactElement => {
  const { attachContext, attachments } = useAgent();
  const isAttached = attachments.some(({ id }) => id === attachment.id);
  const label = isAttached ? 'In the chat' : 'Add to chat';

  return (
    <Tooltip content={label} visible={iconOnly}>
      <Button
        icon={<AtIcon size={IconSize.Size16} />}
        size={size}
        variant={ButtonVariant.Subtle}
        className={classNames(
          // Subtle is an outline with no fill. These sit over live content, and
          // some of them overlay it outright, so the fill has to be opaque.
          '!bg-background-subtle',
          // Named group, or the turn wrapping the whole reply is also a
          // `.group` and hovering anywhere in it reveals every button at once.
          reveal &&
            'opacity-0 transition-opacity focus-visible:opacity-100 group-hover/item:opacity-100',
          // A pointer that cannot hover would never find it.
          reveal && '[@media(hover:none)]:opacity-100',
          className,
        )}
        aria-label={`${label}: ${attachment.label}`}
        pressed={isAttached}
        onMouseDown={onMouseDown}
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          attachContext(attachment);
          onAttached?.();
        }}
      >
        {iconOnly ? undefined : label}
      </Button>
    </Tooltip>
  );
};
