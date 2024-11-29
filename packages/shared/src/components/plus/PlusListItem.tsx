import React, { ReactElement } from 'react';
import classNames from 'classnames';
import ConditionalWrapper from '../ConditionalWrapper';
import { SimpleTooltip } from '../tooltips';
import { ChecklistAIcon, InfoIcon } from '../icons';
import { IconProps, IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyProps,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { usePaymentContext } from '../../contexts/PaymentContext';

export enum PlusItemStatus {
  Ready = 'done',
  Disabled = 'disabled',
  ComingSoon = 'coming-soon',
}

export interface PlusItem {
  label: string;
  status: PlusItemStatus;
  tooltip?: string;
}

export interface PlusListItemProps {
  item: PlusItem;
  typographyProps?: TypographyProps<TypographyTag.P>;
  iconProps?: IconProps;
  badgeProps?: TypographyProps<TypographyTag.Span>;
}

export const SimplePlusListItem = ({
  item,
  typographyProps,
  iconProps,
}: PlusListItemProps): ReactElement => {
  return (
    <li className="flex gap-2">
      <ChecklistAIcon
        size={IconSize.Small}
        {...iconProps}
        className={classNames('text-text-quaternary', iconProps?.className)}
      />
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        {...typographyProps}
        className={classNames('flex-1', typographyProps?.className)}
      >
        {item.label}
      </Typography>
    </li>
  );
};

const PlusListItemWithTooltip = ({
  badgeProps,
  iconProps,
  item,
  typographyProps,
}: PlusListItemProps): ReactElement => {
  return (
    <ConditionalWrapper
      condition={!!item.tooltip}
      wrapper={(component: ReactElement) => (
        <SimpleTooltip
          container={{ className: 'tablet:max-w-72' }}
          content={item.tooltip}
          delay={0}
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
      >
        <ChecklistAIcon
          aria-hidden
          size={IconSize.XSmall}
          {...iconProps}
          className={classNames(
            'mr-1 mt-0.5 inline-block text-text-quaternary',
            iconProps?.className,
          )}
        />
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          {...typographyProps}
          className={classNames(
            'flex flex-1 flex-wrap items-baseline gap-2',
            typographyProps?.className,
          )}
        >
          <span>{item.label}</span>
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
        {item.tooltip && <InfoIcon />}
      </li>
    </ConditionalWrapper>
  );
};

export const PlusListItem = (props: PlusListItemProps): ReactElement => {
  const { earlyAdopterPlanId } = usePaymentContext();
  const isEarlyAdopterExperiment = !!earlyAdopterPlanId;

  if (isEarlyAdopterExperiment) {
    return <PlusListItemWithTooltip {...props} />;
  }

  return <SimplePlusListItem {...props} />;
};
