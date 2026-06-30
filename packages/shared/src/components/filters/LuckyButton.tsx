import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { SparkleIcon } from '../icons';
import { IconSize } from '../Icon';
import { gqlClient } from '../../graphql/common';
import { LUCKY_POST_QUERY } from '../../graphql/luckyPost';
import type { LuckyPostData } from '../../graphql/luckyPost';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { LogEvent } from '../../lib/log';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureLuckyButton } from '../../lib/featureManagement';
import { useToastNotification } from '../../hooks/useToastNotification';
import { Tooltip } from '../tooltip/Tooltip';

export const LuckyButton = (): ReactElement | null => {
  const { isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { value: isEnabled } = useConditionalFeature({
    feature: featureLuckyButton,
    shouldEvaluate: isAuthReady,
  });

  const { mutate: pickLuckyPost, isPending } = useMutation({
    mutationFn: async () => {
      const data = await gqlClient.request<LuckyPostData>(LUCKY_POST_QUERY);
      const post = data.randomTrendingPosts?.[0];
      if (!post?.commentsPermalink) {
        throw new Error('No lucky post available');
      }
      return post;
    },
    onSuccess: (post) => {
      window.location.assign(post.commentsPermalink);
    },
    onError: () => {
      displayToast('Bad luck — try again in a moment.');
    },
  });

  if (!isEnabled) {
    return null;
  }

  const onClick = () => {
    if (isPending) {
      return;
    }
    logEvent({
      event_name: LogEvent.Click,
      target_type: 'lucky button',
    });
    pickLuckyPost();
  };

  return (
    <Tooltip content="Feeling lucky?">
      <Button
        type="button"
        variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
        size={ButtonSize.Medium}
        icon={
          <SparkleIcon
            size={IconSize.Medium}
            className={classNames(
              'transition-transform duration-300 ease-out motion-reduce:transition-none',
              isPending
                ? 'animate-spin'
                : 'group-hover:rotate-[20deg] group-hover:scale-110',
            )}
          />
        }
        className="group"
        onClick={onClick}
        disabled={isPending}
        aria-label="Feeling lucky"
      />
    </Tooltip>
  );
};
