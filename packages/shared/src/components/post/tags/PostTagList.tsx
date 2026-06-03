import type { ReactElement } from 'react';
import React, { memo, useMemo } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { useFollowPostTags } from '../../../hooks/feed/useFollowPostTags';
import { TagChip } from '../../tags/TagChip';
import { BrandedTag } from '../../brand/BrandedTag';
import { useBrandSponsorship } from '../../../hooks/useBrandSponsorship';
import Link from '../../utilities/Link';
import { getTagPageLink } from '../../../lib';
import { Button, ButtonSize } from '../../buttons/Button';
import { PlusIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { Tooltip } from '../../tooltip/Tooltip';

interface PostTagListProps {
  post: Post;
}

interface BrandedTagChipProps {
  tag: string;
  isFollowed: boolean;
  onFollow: (tag: string) => void;
  disableBranding?: boolean;
}

const BrandedTagChip = ({
  tag,
  isFollowed,
  onFollow,
  disableBranding,
}: BrandedTagChipProps): ReactElement => (
  <span
    role="listitem"
    className={classNames(
      'inline-flex items-center rounded-8',
      isFollowed ? '' : 'bg-surface-float',
    )}
  >
    <Link href={getTagPageLink(tag)} passHref prefetch={false}>
      <a title={`Check all #${tag} posts`}>
        <BrandedTag
          tag={tag}
          asSpan
          disableBranding={disableBranding}
          className={
            isFollowed
              ? 'border px-2 py-1 hover:bg-border-subtlest-tertiary'
              : '!h-auto !border-0 !bg-transparent py-1'
          }
        />
      </a>
    </Link>
    {!isFollowed && (
      <>
        <span
          aria-hidden
          role="separator"
          className="mx-2 h-3 w-px bg-border-subtlest-tertiary"
        />
        <Tooltip content={`Follow #${tag}`}>
          <Button
            type="button"
            size={ButtonSize.XSmall}
            icon={<PlusIcon aria-hidden size={IconSize.XSmall} />}
            onClick={() => onFollow(tag)}
            aria-label={`Follow #${tag}`}
          />
        </Tooltip>
      </>
    )}
  </span>
);

const PostTagListInner = ({ post }: PostTagListProps): ReactElement => {
  const { onFollowTag, tags } = useFollowPostTags({ post });
  const { isTagSponsored } = useBrandSponsorship();

  const firstSponsoredTag = useMemo(
    () => tags.all.find((tag) => isTagSponsored(tag)) || null,
    [tags.all, isTagSponsored],
  );

  if (!tags.all.length) {
    return null;
  }

  const followedSet = new Set(tags.followed);
  const useBrandedRenderer = firstSponsoredTag !== null;

  return (
    <ul aria-label="Post tags" className="flex flex-wrap items-center gap-2">
      {tags.all.map((tag) => {
        const isFollowed = followedSet.has(tag);

        if (useBrandedRenderer) {
          return (
            <BrandedTagChip
              key={tag}
              tag={tag}
              isFollowed={isFollowed}
              onFollow={onFollowTag}
              disableBranding={tag !== firstSponsoredTag}
            />
          );
        }

        return (
          <TagChip
            key={tag}
            tag={tag}
            size="sm"
            isFollowed={isFollowed}
            onFollow={onFollowTag}
          />
        );
      })}
    </ul>
  );
};

export const PostTagList = memo(
  PostTagListInner,
  (prev, next) => prev.post?.tags?.join() === next.post?.tags?.join(),
);
