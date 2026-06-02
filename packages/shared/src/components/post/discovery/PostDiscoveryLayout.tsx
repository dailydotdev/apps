import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import type { Post } from '../../../graphql/posts';
import type { PostOrigin } from '../../../hooks/log/useLogContextData';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ArrowIcon } from '../../icons';
import { BuildYourFeedWidget } from '../BuildYourFeedWidget';
import type { FocusCardLeftVariant } from './PostFocusCard';
import { PostFocusCard } from './PostFocusCard';
import { PostDiscoveryFeed } from './PostDiscoveryFeed';

interface PostDiscoveryLayoutProps {
  post: Post;
  origin: PostOrigin;
  leftVariant?: FocusCardLeftVariant;
}

const BackToTop = (): ReactElement | null => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = (): void => {
      setIsVisible(globalThis.window.scrollY > 800);
    };
    onScroll();
    globalThis.window.addEventListener('scroll', onScroll, { passive: true });

    return () => globalThis.window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    globalThis.window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-3 -rotate-90"
      icon={<ArrowIcon />}
      onClick={scrollToTop}
      size={ButtonSize.Large}
      type="button"
      variant={ButtonVariant.Primary}
    />
  );
};

export const PostDiscoveryLayout = ({
  post,
  origin,
  leftVariant = 'rich',
}: PostDiscoveryLayoutProps): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();

  useEffect(() => {
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.Post,
      target_id: post.id,
      extra: JSON.stringify({ origin, surface: 'post_discovery' }),
    });
    // Fire once per post on this surface.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  return (
    <div className="flex w-full flex-col bg-background-default">
      <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-10 px-4 py-6 tablet:px-6 laptop:px-8 laptop:py-8">
        <div className="mx-auto w-full max-w-[75rem]">
          <PostFocusCard
            leftVariant={leftVariant}
            origin={origin}
            post={post}
          />
        </div>

        {!user && (
          <div className="mx-auto w-full max-w-[64rem]">
            <div className="shadow-1 overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-4 tablet:p-6">
              <BuildYourFeedWidget />
            </div>
          </div>
        )}

        <PostDiscoveryFeed post={post} />
      </div>
      <BackToTop />
    </div>
  );
};
