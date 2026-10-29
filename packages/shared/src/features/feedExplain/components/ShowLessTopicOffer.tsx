import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MinusIcon } from '../../../components/icons/Minus';
import type { Origin } from '../../../lib/log';
import { FeedTopicMode } from '../types';
import { useFeedControls } from '../useFeedControls';

interface ShowLessTopicOfferProps {
  /** The topic that brought the hidden post in. */
  tag: string;
  origin: Origin;
  className?: string;
}

/**
 * After a hide, which removes only the post: show less of the topic that
 * brought it in. Not offered once the reader set the topic's level.
 */
export const ShowLessTopicOffer = ({
  tag,
  origin,
  className,
}: ShowLessTopicOfferProps): ReactElement | null => {
  const { controls, getTopicMode, setTopicMode } = useFeedControls({ origin });
  const [isLowered, setIsLowered] = useState(false);

  const mode = getTopicMode(tag);
  if (!controls || (mode && !(isLowered && mode === FeedTopicMode.Demote))) {
    return null;
  }

  if (mode) {
    return (
      <span
        className={classNames(
          'flex items-center gap-1 pl-1.5 text-text-tertiary typo-footnote',
          className,
        )}
      >
        Showing less #{tag}
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={() => {
            setTopicMode(tag, null);
            setIsLowered(false);
          }}
        >
          Undo
        </Button>
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant={ButtonVariant.Tertiary}
      color={ButtonColor.Bun}
      size={ButtonSize.XSmall}
      icon={<MinusIcon />}
      className={classNames('self-start', className)}
      onClick={() => {
        setTopicMode(tag, FeedTopicMode.Demote);
        setIsLowered(true);
      }}
    >
      Show less #{tag}?
    </Button>
  );
};
