import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  AiIcon,
  BulletListIcon,
  DocsIcon,
  MiniCloseIcon,
  TimerIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { AgentAttachment } from '../chat';

export const attachmentIcon: Record<AgentAttachment['kind'], ReactElement> = {
  post: <DocsIcon size={IconSize.Size16} />,
  feed: <BulletListIcon size={IconSize.Size16} />,
  guidance: <AiIcon size={IconSize.Size16} />,
  activity: <TimerIcon size={IconSize.Size16} />,
};

/**
 * A reference the next prompt carries. Removable in the composer, fixed once
 * the turn has been sent, which is why the cross is opt-in.
 */
export const AgentAttachmentChip = ({
  attachment,
  onRemove,
  className,
}: {
  attachment: AgentAttachment;
  onRemove?: () => void;
  className?: string;
}): ReactElement => (
  // On an opaque surface rather than a float wash: the chip sits inside the
  // composer, which is itself a float, and a wash on a wash has no edge. The
  // label is primary ink for the same reason — a reference you deliberately
  // attached is not secondary information, and tertiary on float read as
  // disabled.
  <span
    className={classNames(
      'flex max-w-[13rem] items-center gap-1 rounded-8 border border-border-subtlest-secondary bg-background-subtle py-0.5 pl-1.5',
      onRemove ? 'pr-0.5' : 'pr-1.5',
      className,
    )}
  >
    <span className="shrink-0 text-text-tertiary">
      {attachmentIcon[attachment.kind]}
    </span>
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Primary}
      className="min-w-0 flex-1 truncate"
    >
      {attachment.label}
    </Typography>
    {onRemove && (
      <button
        type="button"
        aria-label={`Remove ${attachment.label}`}
        onClick={onRemove}
        className="flex size-4 shrink-0 items-center justify-center rounded-6 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
      >
        <MiniCloseIcon size={IconSize.Size16} />
      </button>
    )}
  </span>
);
