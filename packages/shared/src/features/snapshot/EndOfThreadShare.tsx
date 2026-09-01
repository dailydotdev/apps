import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { ButtonV2 } from '../../components/buttons/ButtonV2';
import {
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/common';
import { LinkIcon } from '../../components/icons';
import { useCopyText } from '../../hooks/useCopy';
import {
  ToastType,
  useToastNotification,
} from '../../hooks/useToastNotification';
import type { Post } from '../../graphql/posts';

/**
 * #6349's end-of-conversation band. It sits where reading actually stops, and
 * copy link is the whole offer: a still image of a live thread is stale within
 * hours, so there is no snapshot here.
 */
export function EndOfThreadShare({
  post,
  commentsCount,
}: {
  post: Post;
  commentsCount: number;
}): ReactElement | null {
  const [, copy] = useCopyText(post.commentsPermalink);
  const { displayToast } = useToastNotification();

  const onCopy = useCallback(async () => {
    try {
      await copy({ message: '✅ Copied link' });
    } catch {
      displayToast('❌ Your browser blocked the clipboard', {
        variant: ToastType.Error,
      });
    }
  }, [copy, displayToast]);

  // Nothing to be at the end of: an empty thread has no conversation to pass
  // on, and the band would just be a second copy-link button.
  if (!commentsCount) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold text-text-primary typo-callout">
          Enjoyed this discussion?
        </span>
        <span className="text-text-tertiary typo-callout">
          Send it to someone who&apos;d have opinions.
        </span>
      </div>
      <ButtonV2
        icon={<LinkIcon />}
        iconPosition={ButtonIconPosition.Right}
        onClick={onCopy}
        size={ButtonSize.Small}
        type="button"
        variant={ButtonVariant.Primary}
      >
        Copy link
      </ButtonV2>
    </div>
  );
}
