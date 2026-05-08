import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { SparkleIcon } from '../icons';
import { IconSize } from '../Icon';
import { gqlClient } from '../../graphql/common';
import { LUCKY_POST_QUERY } from '../../graphql/luckyPost';
import type { LuckyPostData } from '../../graphql/luckyPost';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { useViewSize, ViewSize } from '../../hooks';
import { Tooltip } from '../tooltip/Tooltip';

export const LuckyButton = (): ReactElement => {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const data = await gqlClient.request<LuckyPostData>(LUCKY_POST_QUERY);
      const post = data.randomTrendingPosts?.[0];
      if (!post?.commentsPermalink) {
        return;
      }
      logEvent({
        event_name: LogEvent.Click,
        target_id: post.id,
        extra: JSON.stringify({ origin: 'lucky button' }),
      });
      router.push(post.commentsPermalink);
    } finally {
      setIsLoading(false);
    }
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
            className={isLoading ? 'animate-spin' : undefined}
          />
        }
        onClick={onClick}
        disabled={isLoading}
        aria-label="Feeling lucky"
      />
    </Tooltip>
  );
};
