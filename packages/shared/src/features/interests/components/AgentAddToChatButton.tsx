import type { ReactElement } from 'react';
import React from 'react';
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
 */
export const AgentAddToChatButton = ({
  attachment,
  size = ButtonSize.XSmall,
  className,
}: {
  attachment: AgentAttachment;
  size?: ButtonSize;
  className?: string;
}): ReactElement => {
  const { attachContext, attachments } = useAgent();
  const isAttached = attachments.some(({ id }) => id === attachment.id);

  return (
    <Tooltip content={isAttached ? 'Already in the chat' : 'Add to chat'}>
      <Button
        icon={<AtIcon size={IconSize.Size16} />}
        size={size}
        variant={ButtonVariant.Tertiary}
        className={className}
        aria-label={`Add ${attachment.label} to the chat`}
        pressed={isAttached}
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          attachContext(attachment);
        }}
      />
    </Tooltip>
  );
};
