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
import { withExperiment } from '../withExperiment';
import { feature } from '../../lib/featureManagement';

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
  text?: TypographyProps<TypographyTag.P>;
  icon?: IconProps;
}

export const SimplePlusListItem = ({
  item,
  text,
  icon,
}: PlusListItemProps): ReactElement => {
  return (
    <li className="flex gap-2">
      <ChecklistAIcon
        className="text-text-quaternary"
        size={IconSize.Small}
        {...icon}
      />
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        {...text}
        className={classNames('flex-1', text?.className)}
      >
        {item.label}
      </Typography>
    </li>
  );
};

const PlusListItemWithTooltip = ({
  item,
  text,
  icon,
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
          'flex gap-2 rounded-6 p-1',
          !!item.tooltip && 'hover:bg-surface-float',
        )}
      >
        <div className="mt-0.5 inline-block ">
          <ChecklistAIcon
            className="text-text-quaternary"
            size={IconSize.XSmall}
            {...icon}
          />
        </div>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          {...text}
          className={classNames('flex flex-1 flex-wrap gap-2', text?.className)}
        >
          {item.label}
          {item.status === PlusItemStatus.ComingSoon && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="rounded-6 bg-surface-float px-2 py-0.5"
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

export const PlusListItem = withExperiment(PlusListItemWithTooltip, {
  fallback: SimplePlusListItem,
  feature: feature.plusEarlyAdopter,
  value: true,
});
