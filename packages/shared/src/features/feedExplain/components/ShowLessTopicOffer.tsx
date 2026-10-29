import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MinusIcon } from '../../../components/icons/Minus';
import useFeedSettings from '../../../hooks/useFeedSettings';
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
 * brought it in. Not offered for a blocked topic, or once the reader set the
 * topic's level.
 */
export const ShowLessTopicOffer = ({
  tag,
  origin,
  className,
}: ShowLessTopicOfferProps): ReactElement | null => {
  const { controls, getTopicMode, setTopicMode } = useFeedControls({ origin });
  const { feedSettings } = useFeedSettings();
  const [isLowered, setIsLowered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shouldFocus = useRef(false);
  const mode = getTopicMode(tag);
  const isShowingLess = isLowered && mode === FeedTopicMode.Demote;

  // The clicked button is swapped for the other one, so focus follows it.
  useEffect(() => {
    if (shouldFocus.current) {
      shouldFocus.current = false;
      buttonRef.current?.focus();
    }
  }, [isShowingLess]);

  if (
    !controls ||
    feedSettings?.blockedTags?.includes(tag) ||
    (mode && !isShowingLess)
  ) {
    return null;
  }

  const onToggle = (isLess: boolean) => {
    shouldFocus.current = true;
    setTopicMode(tag, isLess ? FeedTopicMode.Demote : null);
    setIsLowered(isLess);
  };

  if (isShowingLess) {
    return (
      <span
        className={classNames(
          'flex items-center gap-1 pl-1.5 text-text-tertiary typo-footnote',
          className,
        )}
      >
        Showing less #{tag}
        <Button
          ref={buttonRef}
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          aria-label={`Undo show less #${tag}`}
          onClick={() => onToggle(false)}
        >
          Undo
        </Button>
      </span>
    );
  }

  return (
    <Button
      ref={buttonRef}
      type="button"
      variant={ButtonVariant.Tertiary}
      color={ButtonColor.Bun}
      size={ButtonSize.XSmall}
      icon={<MinusIcon />}
      className={classNames('self-start', className)}
      onClick={() => onToggle(true)}
    >
      Show less #{tag}?
    </Button>
  );
};
