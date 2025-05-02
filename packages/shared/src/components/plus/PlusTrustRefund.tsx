import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import { PrivacyIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

type PlusTrustRefundProps = ComponentProps<'div'>;

const alerts = {
  refund: {
    icon: PrivacyIcon,
    iconClassName: 'bg-action-comment-float text-accent-blueCheese-default',
    text: '30 day hassle-free refund. No questions asked.',
  },
};

export const PlusTrustRefund = ({
  className,
  ...attrs
}: PlusTrustRefundProps): ReactElement => {
  const items = [alerts.refund];

  return (
    <>
      {items.map(({ icon: Icon, iconClassName, text }) => (
        <div
          aria-label="Refund policy"
          className={classNames(
            'flex items-center gap-2 rounded-10 bg-surface-float px-3 py-2',
            className,
          )}
          key={text}
          {...attrs}
        >
          <div
            aria-hidden
            className={classNames(
              'grid size-8 place-items-center rounded-10',
              iconClassName,
            )}
          >
            <Icon secondary size={IconSize.Medium} />
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
