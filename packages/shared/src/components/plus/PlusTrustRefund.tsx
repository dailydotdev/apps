import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import { BellIcon, PrivacyIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

interface PlusTrustRefundProps extends ComponentProps<'div'> {
  withFreeTrial?: boolean;
}

const refundAlert = {
  icon: PrivacyIcon,
  iconClassName: 'bg-action-comment-float text-accent-blueCheese-default',
  text: '30 day hassle-free refund. No questions asked.',
};

const alerts = [
  {
    icon: BellIcon,
    iconClassName: 'bg-action-upvote-float text-action-upvote-default',
    text: '7-day free trial, Cancel anytime.',
  },
  refundAlert,
  {
    icon: BellIcon,
    iconClassName: 'bg-action-bookmark-float text-accent-bun-default',
    text: "We'll email you a reminder before your trial ends.",
  },
];

export const PlusTrustRefund = ({
  className,
  withFreeTrial,
  ...attrs
}: PlusTrustRefundProps): ReactElement => {
  const items = withFreeTrial ? alerts : [refundAlert];

  return (
    <>
      {items.map(({ icon: Icon, iconClassName, text }) => (
        <div
          aria-label="Refund policy"
          className={classNames(
            'flex items-center gap-2 rounded-10 bg-surface-float ',
            className,
            !withFreeTrial && 'px-3 py-2',
            withFreeTrial && 'flex-1 flex-col p-4 text-center',
          )}
          key={text}
          {...attrs}
        >
          <div
            aria-hidden
            className={classNames(
              'grid size-8 place-items-center rounded-10',
              withFreeTrial && 'laptop:size-12',
              iconClassName,
            )}
          >
            <Icon
              secondary
              size={withFreeTrial ? IconSize.Large : IconSize.Medium}
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
