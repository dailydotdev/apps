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
}: {
  attachment: AgentAttachment;
  /** For toolbars, where it sits among other icon buttons. */
  iconOnly?: boolean;
  /** Kept out of the way until the pointer is on the thing it belongs to. */
  reveal?: boolean;
  size?: ButtonSize;
  className?: string;
}): ReactElement => {
  const { attachContext, attachments } = useAgent();
  const isAttached = attachments.some(({ id }) => id === attachment.id);
  const label = isAttached ? 'In the chat' : 'Add to chat';

  return (
    <Tooltip content={label} visible={iconOnly}>
      <Button
        icon={<AtIcon size={IconSize.Size16} />}
        size={size}
        variant={ButtonVariant.Float}
        className={classNames(
          // Float's own surface is an 8% wash. These sit over live content, and
          // some of them overlay it outright, so the fill has to be opaque.
          '!bg-background-subtle',
          reveal &&
            'opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100',
          // A pointer that cannot hover would never find it.
          reveal && '[@media(hover:none)]:opacity-100',
          className,
        )}
        aria-label={`${label}: ${attachment.label}`}
        pressed={isAttached}
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          attachContext(attachment);
        }}
      >
        {iconOnly ? undefined : label}
      </Button>
    </Tooltip>
  );
};
