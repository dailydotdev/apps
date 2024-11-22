import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ChecklistAIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyProps,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { IconProps, IconSize } from '../Icon';
import { WithClassNameProps } from '../utilities';

interface PlusItemProps {
  title: string;
  text?: TypographyProps<TypographyTag.P>;
  icon?: IconProps;
}

export const defaultFeatureList = [
  'Hyper-personalized feed',
  'AI-powered search',
  'Squads (developer communities)',
  'Advanced customizations',
  '100+ more features',
];

export const plusFeatureList = [
  'Ads-free browsing',
  'Exclusive Plus badge',
  'Private squad for Plus members',
  'Support the team and make us smile',
  'And so much more coming soon...',
];

const PlusItem = ({ title, text, icon }: PlusItemProps) => {
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
      >
        {title}
      </Typography>
    </li>
  );
};

interface PlusListProps
  extends Omit<PlusItemProps, 'title'>,
    WithClassNameProps {
  items?: string[];
}

export const PlusList = ({
  className,
  items = plusFeatureList,
  ...props
}: PlusListProps & WithClassNameProps): ReactElement => {
  return (
    <ul className={classNames('flex flex-col gap-2 py-6', className)}>
      {items.map((title) => (
        <PlusItem key={title} title={title} {...props} />
      ))}
    </ul>
  );
};
