import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import { MenuIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';

type AgentEmbedCardProps = {
  /** Leading tile glyph. Shown in both variants. */
  icon?: ReactElement;
  /** Preview area above the footer. Its presence is what makes this a card. */
  media?: ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  onMenu?: () => void;
  className?: string;
};

export const AgentEmbedCard = ({
  icon,
  media,
  title,
  subtitle,
  actionLabel,
  onAction,
  onMenu,
  className,
}: AgentEmbedCardProps): ReactElement => (
  <div
    className={classNames(
      'w-full overflow-hidden rounded-12 border border-border-subtlest-quaternary bg-background-default transition-colors hover:border-border-subtlest-tertiary',
      className,
    )}
  >
    {media && (
      <div className="flex aspect-[16/7] w-full items-center justify-center overflow-hidden border-b border-border-subtlest-quaternary bg-surface-float">
        {media}
      </div>
    )}
    <FlexRow className="items-center gap-2.5 p-2.5">
      {icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-surface-float text-text-tertiary">
          {icon}
        </span>
      )}
      <FlexCol className="min-w-0 flex-1 gap-0.5">
        <Typography
          type={TypographyType.Footnote}
          bold
          className="min-w-0 truncate"
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            className="min-w-0 truncate"
          >
            {subtitle}
          </Typography>
        )}
      </FlexCol>
      {actionLabel && (
        <Button
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Primary}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
      {onMenu && (
        <Tooltip content="More options">
          <Button
            icon={<MenuIcon size={IconSize.Size16} className="rotate-90" />}
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Tertiary}
            aria-label="More options"
            onClick={onMenu}
          />
        </Tooltip>
      )}
    </FlexRow>
  </div>
);
