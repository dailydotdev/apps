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

export const addToChatFloat = 'absolute -top-3 right-3 z-1';

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
  iconOnly?: boolean;
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
          // Subtle has no fill, and these overlay live content.
          '!bg-background-subtle',
          // Named group: the turn wrapping the whole reply is also a `.group`,
          // so a plain `group-hover` reveals every button at once.
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
