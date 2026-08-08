import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import type { DealUnlockInvites } from '../types';

interface DealInviteProgressProps {
  invites: DealUnlockInvites;
  avatarUrls?: string[];
  isLarge?: boolean;
  className?: string;
}

export const DealInviteCount = ({
  invites,
  className,
}: {
  invites: DealUnlockInvites;
  className?: string;
}): ReactElement => {
  const isUnlocked = invites.done >= invites.required;

  return (
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption1}
      color={
        isUnlocked ? TypographyColor.StatusSuccess : TypographyColor.Tertiary
      }
      className={classNames('tabular-nums', className)}
    >
      {invites.done} of {invites.required} invites in
    </Typography>
  );
};

export const DealInviteProgress = ({
  invites,
  avatarUrls,
  isLarge,
  className,
}: DealInviteProgressProps): ReactElement => {
  const { required, done } = invites;
  const slots = Array.from({ length: required }, (_, index) => index);

  return (
    <span
      role="progressbar"
      aria-label="Invites towards this unlock"
      aria-valuemin={0}
      aria-valuemax={required}
      aria-valuenow={Math.min(done, required)}
      aria-valuetext={`${done} of ${required} invites in`}
      className={classNames(
        'flex',
        isLarge ? 'gap-2' : '-space-x-1',
        className,
      )}
    >
      {slots.map((index) => {
        const isFilled = index < done;
        const avatarUrl = isFilled ? avatarUrls?.[index] : undefined;

        if (!isLarge) {
          return (
            <span
              key={`invite-${index}`}
              className={classNames(
                'size-5 rounded-full border border-background-subtle',
                isFilled ? 'bg-action-plus-default' : 'bg-surface-secondary',
              )}
            />
          );
        }

        return (
          <span
            key={`invite-${index}`}
            className={classNames(
              'flex size-10 items-center justify-center overflow-hidden rounded-full',
              isFilled && 'bg-action-plus-default',
              !isFilled &&
                'border border-dashed border-border-subtlest-secondary',
            )}
          >
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt=""
                aria-hidden
                loading="lazy"
                className="size-full object-cover"
              />
            )}
          </span>
        );
      })}
    </span>
  );
};
