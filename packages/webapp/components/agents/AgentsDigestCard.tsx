import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import SourceActionsNotify from '@dailydotdev/shared/src/components/sources/SourceActions/SourceActionsNotify';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useSourceActions } from '@dailydotdev/shared/src/hooks/source/useSourceActions';
import {
  stripHtmlTags,
  truncateAtWordBoundary,
} from '@dailydotdev/shared/src/lib/strings';
import {
  formatDate,
  oneDay,
  oneHour,
  TimeFormatType,
} from '@dailydotdev/shared/src/lib/dateFormat';

const TLDR_PARAGRAPH_REGEX =
  /<p>\s*<strong>\s*TL;?DR:?\s*<\/strong>\s*([\s\S]*?)<\/p>/i;
const TLDR_HEADING_REGEX = /<h[1-6][^>]*>\s*TL;?DR\s*:?\s*<\/h[1-6]>/i;
const NEXT_HEADING_REGEX = /<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/i;
const FIRST_PARAGRAPH_REGEX = /<p[^>]*>([\s\S]*?)<\/p>/i;
const DIGEST_PREVIEW_MAX_LENGTH = 420;
const DIGEST_PREVIEW_FALLBACK = 'Open the latest digest update to read more.';

const extractTldrFromContentHtml = (
  contentHtml?: string | null,
): string | undefined => {
  if (!contentHtml) {
    return undefined;
  }

  const tldrParagraphMatch = contentHtml.match(TLDR_PARAGRAPH_REGEX);
  if (tldrParagraphMatch?.[1]) {
    const tldrParagraph = stripHtmlTags(tldrParagraphMatch[1]).trim();
    if (tldrParagraph) {
      return tldrParagraph;
    }
  }

  const tldrHeadingMatch = contentHtml.match(TLDR_HEADING_REGEX);
  if (!tldrHeadingMatch || typeof tldrHeadingMatch.index !== 'number') {
    return undefined;
  }

  const afterTldrStart = tldrHeadingMatch.index + tldrHeadingMatch[0].length;
  const afterTldrContent = contentHtml.slice(afterTldrStart);
  const nextHeadingMatch = afterTldrContent.match(NEXT_HEADING_REGEX);
  const tldrHtml =
    nextHeadingMatch && typeof nextHeadingMatch.index === 'number'
      ? afterTldrContent.slice(0, nextHeadingMatch.index)
      : afterTldrContent;
  const tldr = stripHtmlTags(tldrHtml).trim();

  return tldr || undefined;
};

const extractDigestPreview = (contentHtml?: string | null): string => {
  const tldrContent = extractTldrFromContentHtml(contentHtml);
  if (tldrContent) {
    return tldrContent;
  }

  if (contentHtml) {
    const firstParagraphMatch = contentHtml.match(FIRST_PARAGRAPH_REGEX);
    const firstParagraph = firstParagraphMatch?.[1]
      ? stripHtmlTags(firstParagraphMatch[1]).trim()
      : stripHtmlTags(contentHtml).trim();

    if (firstParagraph) {
      return truncateAtWordBoundary(firstParagraph, DIGEST_PREVIEW_MAX_LENGTH);
    }
  }

  return DIGEST_PREVIEW_FALLBACK;
};

const DigestSubscribeButton = ({
  source,
}: {
  source: Source;
}): ReactElement => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { feedSettings, isLoading: isFeedSettingsLoading } = useFeedSettings({
    enabled: isLoggedIn && !!source?.id,
  });
  const { isFollowing, toggleFollow, haveNotificationsOn, toggleNotify } =
    useSourceActions({ source });
  const isFollowStatePending =
    !isAuthReady || (isLoggedIn && (isFeedSettingsLoading || !feedSettings));

  if (isFollowStatePending) {
    return null;
  }

  if (isFollowing) {
    return (
      <SourceActionsNotify
        haveNotificationsOn={haveNotificationsOn}
        onClick={async (event) => {
          event.preventDefault();
          event.stopPropagation();
          await toggleNotify();
        }}
      />
    );
  }

  return (
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      className="w-28"
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await toggleFollow();
      }}
    >
      Subscribe
    </Button>
  );
};

interface AgentsDigestCardProps {
  post?: Post | null;
  source?: Source | null;
  onCopyLink: () => void;
}

export const AgentsDigestCard = ({
  post,
  source,
  onCopyLink,
}: AgentsDigestCardProps): ReactElement | null => {
  const digestTldr = useMemo(
    () => extractDigestPreview(post?.contentHtml),
    [post?.contentHtml],
  );
  const digestUpdatedLabel = useMemo(() => {
    if (!post?.createdAt) {
      return null;
    }

    const createdDate = new Date(post.createdAt);
    const elapsedSeconds = (Date.now() - createdDate.getTime()) / 1000;

    if (elapsedSeconds < oneDay) {
      const hours = Math.max(1, Math.floor(elapsedSeconds / oneHour));
      return `${hours}h ago`;
    }

    return formatDate({
      value: post.createdAt,
      type: TimeFormatType.Post,
    });
  }, [post?.createdAt]);

  if (!post) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="mb-2 flex items-start gap-2">
        <div className="flex flex-col">
          <h2 className="font-bold text-text-primary typo-callout">
            Today&apos;s Digest
          </h2>
          {digestUpdatedLabel && (
            <span className="text-text-tertiary typo-caption1">
              Last updated {digestUpdatedLabel}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {!!source?.id && <DigestSubscribeButton source={source} />}
          <Tooltip content="Copy link">
            <Button
              type="button"
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              aria-label="Copy link"
              icon={<CopyIcon size={IconSize.XSmall} />}
              onClick={onCopyLink}
            />
          </Tooltip>
          <Link href={post.commentsPermalink}>
            <a className="text-text-link typo-caption1">Read more</a>
          </Link>
        </div>
      </div>
      {!!digestTldr && (
        <div className="text-text-secondary typo-markdown">{digestTldr}</div>
      )}
    </section>
  );
};
