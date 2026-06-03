import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexCol } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { LockIcon, GiftIcon } from '../../../components/icons';
import type { GivebackReward } from '../types';

interface SecretRewardTileProps {
  reward: GivebackReward;
  /** Whether the user has reached the level that holds this reward. */
  isUnlocked: boolean;
}

export const SecretRewardTile = ({
  reward,
  isUnlocked,
}: SecretRewardTileProps): ReactElement => {
  const showsMystery = reward.isSecret && !isUnlocked;

  return (
    <FlexCol
      className={classNames(
        'items-center gap-1 rounded-12 border p-3 text-center transition-colors',
        isUnlocked
          ? 'border-accent-cheese-default/40 bg-accent-cheese-subtlest'
          : 'border-dashed border-border-subtlest-tertiary bg-surface-secondary',
      )}
    >
      <span
        className={classNames(
          'flex size-8 items-center justify-center rounded-full',
          isUnlocked
            ? 'bg-accent-cheese-default/20 text-accent-cheese-default'
            : 'bg-surface-float text-text-quaternary',
        )}
      >
        {showsMystery ? <LockIcon /> : <GiftIcon />}
      </span>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={isUnlocked ? TypographyColor.Primary : TypographyColor.Tertiary}
        bold
      >
        {showsMystery ? reward.secretTitle : reward.title}
      </Typography>
      {!showsMystery && reward.description && (
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
        >
          {reward.description}
        </Typography>
      )}
    </FlexCol>
  );
};
