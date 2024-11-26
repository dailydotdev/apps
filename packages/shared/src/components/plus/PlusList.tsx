import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ChecklistAIcon, InfoIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyProps,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { IconProps, IconSize } from '../Icon';
import { WithClassNameProps } from '../utilities';
import { SimpleTooltip } from '../tooltips';
import ConditionalWrapper from '../ConditionalWrapper';

enum PlusItemStatus {
  Ready = 'done',
  ComingSoon = 'coming-soon',
}

interface PlusItem {
  label: string;
  status: PlusItemStatus;
  tooltip?: string;
}

interface PlusItemProps {
  item: PlusItem;
  text?: TypographyProps<TypographyTag.P>;
  icon?: IconProps;
}

export const defaultFeatureList: Array<PlusItem> = [
  { label: 'Hyper-personalized feed', status: PlusItemStatus.Ready },
  { label: 'AI-powered search', status: PlusItemStatus.Ready },
  { label: 'Squads (developer communities)', status: PlusItemStatus.Ready },
  { label: 'Advanced customizations', status: PlusItemStatus.Ready },
  { label: '100+ more features', status: PlusItemStatus.Ready },
];

export const plusFeatureList: Array<PlusItem> = [
  {
    label: 'No ads experience',
    status: PlusItemStatus.Ready,
    tooltip: `No ads, no distractions. It’s like noise canceling headphones, but for your feed.`,
  },
  {
    label: 'Exclusive Plus badge',
    status: PlusItemStatus.Ready,
    tooltip: `This badge is like a VIP pass, but for devs who love daily.dev. Flex it on your profile as if you just shipped flawless code.`,
  },
  {
    label: 'Private Squad for Plus members',
    status: PlusItemStatus.Ready,
    tooltip: `Join an exclusive community space to connect with other Plus members, share feedback, and access priority support.`,
  },
  {
    label: 'Support the team and make us smile',
    status: PlusItemStatus.Ready,
    tooltip: `By subscribing to Plus, you help us suffer less and build more (well… mostly suffer less).`,
  },
  {
    label: 'Clickbait-free titles powered by AI',
    status: PlusItemStatus.ComingSoon,
    tooltip: `Say goodbye to clickbait titles and hello to AI-optimized titles that make your feed clearer and more informative.`,
  },
  {
    label: 'Organize bookmarks in folders',
    status: PlusItemStatus.ComingSoon,
    tooltip: `Easily categorize and organize your bookmarked posts into folders, so you can find what you need quickly.`,
  },
  {
    label: 'Keyword blocker',
    status: PlusItemStatus.ComingSoon,
    tooltip: `Automatically filter out posts containing words you never want to see again. Life’s too short for unnecessary noise.`,
  },
  {
    label: 'Advanced custom feeds',
    status: PlusItemStatus.ComingSoon,
    tooltip: `Why settle for one feed when you can have many? Build your personalized content empire, one custom feed at a time.`,
  },
];

const PlusListItem = ({ item, text, icon }: PlusItemProps) => {
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
      <li className="flex items-center gap-2 rounded-6 p-1 hover:bg-surface-float">
        <ChecklistAIcon
          className="text-text-quaternary"
          size={IconSize.XSmall}
          {...icon}
        />
        <div className="flex flex-1 gap-2">
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            {...text}
            className={text?.className}
          >
            {item.label}
          </Typography>
          {item.status === PlusItemStatus.ComingSoon && (
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="rounded-6 bg-surface-float px-2 py-0.5"
            >
              Coming soon
            </Typography>
          )}
        </div>
        {item.tooltip && <InfoIcon />}
      </li>
    </ConditionalWrapper>
  );
};

interface PlusListProps
  extends Omit<PlusItemProps, 'item'>,
    WithClassNameProps {
  items?: PlusItem[];
}

export const PlusList = ({
  className,
  items = plusFeatureList,
  ...props
}: PlusListProps & WithClassNameProps): ReactElement => {
  return (
    <ul className={classNames('flex flex-col gap-0.5 py-6', className)}>
      {items.map((item) => (
        <PlusListItem key={item.label} item={item} {...props} />
      ))}
    </ul>
  );
};
