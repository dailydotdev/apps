import type { FC, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import ConditionalWrapper from '../ConditionalWrapper';
import { SimpleTooltip } from '../tooltips';
import { InfoIcon, VIcon } from '../icons';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import type { TypographyProps } from '../typography/Typography';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

export enum PlusItemStatus {
  Ready = 'done',
  ComingSoon = 'coming-soon',
}

export interface PlusItem {
  label: string;
  status: PlusItemStatus;
  tooltip?: string;
  typographyProps?: TypographyProps<TypographyTag.P>;
  id?: string;
  icon?: ReactElement;
  iconClasses?: string;
  modalProps?: {
    title: string;
    description: string;
    imageUrl?: string;
    videoUrl?: string;
    mediaType?: 'image' | 'video';
  };
}

export interface PlusListItemProps {
  item: PlusItem;
  typographyProps?: TypographyProps<TypographyTag.P>;
  icon?: FC<IconProps>;
  iconProps?: IconProps;
  badgeProps?: TypographyProps<TypographyTag.Span>;
  onHover?: () => void;
}

export const PlusListItem = ({
  badgeProps,
  iconProps,
  icon: Icon = VIcon,
  item,
  typographyProps,
  onHover,
}: PlusListItemProps): ReactElement => {
  return (
    <ConditionalWrapper
      condition={!!item.tooltip}
      wrapper={(component: ReactElement) => (
        <SimpleTooltip
          container={{
            className: 'tablet:max-w-72 text-center',
          }}
          content={item.tooltip}
          delay={0}
          forceLoad
        >
          {component}
        </SimpleTooltip>
      )}
    >
      <li
        className={classNames(
          '-mx-1 flex gap-1 rounded-6 p-1',
          !!item.tooltip && 'hover:bg-surface-float',
        )}
        onMouseEnter={onHover}
      >
        {Icon && (
          <Icon
            aria-hidden
            size={IconSize.XSmall}
            {...iconProps}
            className={classNames(
              'mr-1 mt-px inline-block',
              iconProps?.className,
            )}
          />
        )}
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          {...typographyProps}
          className={classNames(
            '-mt-px flex flex-1 flex-wrap items-baseline gap-2',
            typographyProps?.className,
          )}
        >
          {!Icon && <span className="inline-block min-w-4 text-center">•</span>}
          {item.label}
          {item.status === PlusItemStatus.ComingSoon && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              {...badgeProps}
              className={classNames(
                'rounded-6 bg-surface-float px-2 py-0.5',
                badgeProps?.className,
              )}
            >
              Coming soon
            </Typography>
          )}
        </Typography>
        {item.tooltip && (
          <InfoIcon
            aria-hidden
            {...iconProps}
            className={classNames(
              'mt-px text-text-secondary',
              iconProps?.className,
            )}
          />
        )}
      </li>
    </ConditionalWrapper>
  );
};
