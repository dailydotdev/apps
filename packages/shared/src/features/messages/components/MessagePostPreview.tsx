import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FlexCol } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import { Image } from '../../../components/image/Image';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { dmPostPreviewQueryOptions } from '../queries';

// A daily.dev post shared in a message shows as the post itself. Until it
// loads, or when the reader can't see it, the link in the bubble is enough.
// It lands after the thread jumped to the newest message, so `onLoad` lets
// the thread keep a reader at the bottom.
export const MessagePostPreview = ({
  postId,
  onLoad,
  className,
}: {
  postId: string;
  onLoad?: () => void;
  className?: string;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { data: post } = useQuery(dmPostPreviewQueryOptions(user, postId));
  // A share is about the post it shares; its own title is the commentary.
  const content = post?.sharedPost ?? post;
  const hasCard = !!content?.title;

  useEffect(() => {
    if (hasCard) {
      onLoad?.();
    }
  }, [hasCard, onLoad]);

  if (!post || !content?.title) {
    return null;
  }

  return (
    <Link href={post.commentsPermalink} passHref>
      <a
        className={classNames(
          'flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-2 hover:bg-surface-hover',
          className,
        )}
      >
        <Image
          src={content.image ?? undefined}
          alt=""
          loading="lazy"
          onLoad={onLoad}
          fallbackSrc={cloudinaryPostImageCoverPlaceholder}
          className="size-16 shrink-0 rounded-12 object-cover"
        />
        <FlexCol className="min-w-0 gap-0.5">
          {content.source?.name && (
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              truncate
            >
              {content.source.name}
            </Typography>
          )}
          <Typography
            type={TypographyType.Footnote}
            bold
            className="line-clamp-3"
          >
            {content.title}
          </Typography>
        </FlexCol>
      </a>
    </Link>
  );
};
