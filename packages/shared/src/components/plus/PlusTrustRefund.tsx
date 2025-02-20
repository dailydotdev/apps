import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import { BellIcon, PrivacyIcon, TipIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useViewSize, ViewSize } from '../../hooks';

interface PlusTrustRefundProps extends ComponentProps<'div'> {
  withFreeTrial?: boolean;
}

const alerts = {
  trial: {
    icon: TipIcon,
    iconClassName: 'bg-action-upvote-float text-action-upvote-default',
    text: '7-day free trial, Cancel anytime.',
  },
  refund: {
    icon: PrivacyIcon,
    iconClassName: 'bg-action-comment-float text-accent-blueCheese-default',
    text: '30 day hassle-free refund. No questions asked.',
  },
  reminder: {
    icon: BellIcon,
    iconClassName: 'bg-action-bookmark-float text-accent-bun-default',
    text: "We'll email you a reminder before your trial ends.",
  },
};

export const PlusTrustRefund = ({
  className,
  withFreeTrial = false,
  ...attrs
}: PlusTrustRefundProps): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const hasVerticalLayout = withFreeTrial && isLaptop;
  const items = withFreeTrial
    ? [alerts.trial, alerts.refund, alerts.reminder]
    : [alerts.refund];

  return (
    <>
      {items.map(({ icon: Icon, iconClassName, text }) => (
        <div
          aria-label="Refund policy"
          className={classNames(
            'flex items-center gap-2 rounded-10 bg-surface-float ',
            !hasVerticalLayout && 'px-3 py-2',
            hasVerticalLayout && 'flex-1 flex-col p-4 text-center',
            className,
          )}
          key={text}
          {...attrs}
        >
          <div
            aria-hidden
            className={classNames(
              'grid size-8 place-items-center rounded-10',
              hasVerticalLayout && 'laptop:size-12',
              iconClassName,
            )}
          >
            <Icon
              secondary
              size={hasVerticalLayout ? IconSize.Large : IconSize.Medium}
            />
          </div>
          <Typography
            className="min-w-0 flex-1"
            color={TypographyColor.Primary}
            type={TypographyType.Callout}
          >
            {text}
          </Typography>
        </div>
      ))}
    </>
  );
};
