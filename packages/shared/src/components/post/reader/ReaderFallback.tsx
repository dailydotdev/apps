import type { ReactElement } from 'react';
import React, { forwardRef, useContext, useEffect } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { ButtonV2, ButtonSize, ButtonVariant } from '../../buttons/ButtonV2';
import { LazyImage } from '../../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import SettingsContext from '../../../contexts/SettingsContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import { useReadArticle } from '../../../hooks/usePostContent';

type ReaderFallbackProps = {
  post: Post;
  className?: string;
  contentTopOffsetPx?: number;
};

export const ReaderFallback = forwardRef<HTMLDivElement, ReaderFallbackProps>(
  function ReaderFallback(
    { post, className, contentTopOffsetPx = 0 },
    ref,
  ): ReactElement {
    const { openNewTab } = useContext(SettingsContext);
    const { title } = useSmartTitle(post);
    const { logEvent } = useLogContext();
    const onReadArticle = useReadArticle({ post, origin: Origin.ArticleModal });

    useEffect(() => {
      logEvent({
        event_name: LogEvent.ImpressionReaderFallback,
        target_type: TargetType.Post,
        target_id: post.id,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [post.id]);
    const hostname =
      post.domain && post.domain.length > 0
        ? post.domain
        : (() => {
            if (!post.permalink) {
              return '';
            }
            try {
              return new URL(post.permalink).hostname;
            } catch {
              return post.permalink;
            }
          })();

    return (
      <div
        ref={ref}
        className={classNames(
          'flex min-h-0 flex-1 flex-col overflow-y-auto bg-background-default px-4 pb-6 tablet:px-8',
          className,
        )}
        style={{ paddingTop: contentTopOffsetPx + 24 }}
      >
        <LazyImage
          imgSrc={post.image}
          imgAlt=""
          ratio="49%"
          className="mb-6 max-w-[25.625rem] overflow-hidden rounded-16"
          eager
          fallbackSrc={cloudinaryPostImageCoverPlaceholder}
          fetchPriority="high"
        />
        <Typography type={TypographyType.Title2} className="mb-3 break-words">
          {title}
        </Typography>
        {post.summary && (
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
            className="mb-6"
          >
            {post.summary}
          </Typography>
        )}
        <ButtonV2
          tag="a"
          href={post.permalink}
          target={openNewTab ? '_blank' : '_self'}
          rel="noopener"
          size={ButtonSize.Large}
          variant={ButtonVariant.Primary}
          className="w-fit"
          onClick={onReadArticle}
        >
          Read on {hostname || 'source'}
        </ButtonV2>
      </div>
    );
  },
);
