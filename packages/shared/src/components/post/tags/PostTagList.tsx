import type { PropsWithChildren, ReactElement } from 'react';
import React, { memo, useMemo } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { useFollowPostTags } from '../../../hooks/feed/useFollowPostTags';
import type { TypographyProps } from '../../typography/Typography';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { getTagPageLink } from '../../../lib';
import Link from '../../utilities/Link';
import { Button, ButtonSize } from '../../buttons/Button';
import { PlusIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { Tooltip } from '../../tooltip/Tooltip';
import { BrandedTag } from '../../brand/BrandedTag';
import { useBrandSponsorship } from '../../../hooks/useBrandSponsorship';

interface PostTagListProps {
  post: Post;
}

interface PostTagItemProps {
  isFollowed?: boolean;
  onFollow?: (tag: string) => void;
  tag: string;
  disableBranding?: boolean;
}

const Chip = <T extends TypographyTag>({
  children,
  className,
  ...props
}: PropsWithChildren<TypographyProps<T>>) => (
  <Typography
    className={classNames(
      'cursor-pointer rounded-10 border-border-subtlest-tertiary transition-colors',
      className,
    )}
    color={TypographyColor.Tertiary}
    tag={TypographyTag.Span}
    type={TypographyType.Caption1}
    {...props}
  >
    {children}
  </Typography>
);

const PostTagItem = ({
  isFollowed,
  onFollow,
  tag,
  disableBranding,
}: PostTagItemProps): ReactElement => {
  return (
    <Chip
      className={classNames(
        'flex items-center',
        isFollowed ? '' : 'bg-surface-float',
      )}
      role="listitem"
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
      <span
        className="h-3 translate-y-px rounded-2 border border-border-subtlest-tertiary"
        role="separator"
      />
      <Tooltip content={`Follow #${tag}`}>
        <Button
          icon={<PlusIcon aria-hidden size={IconSize.XSmall} />}
          onClick={() => onFollow(tag)}
          size={ButtonSize.XSmall}
          type="button"
        />
      </Tooltip>
      {!isFollowed && (
        <>
          <span
            className="h-3 translate-y-px rounded-2 border border-border-subtlest-tertiary"
            role="separator"
          />
          <Tooltip content={`Follow #${tag}`}>
            <Button
              icon={<PlusIcon aria-hidden size={IconSize.XSmall} />}
              onClick={() => onFollow(tag)}
              size={ButtonSize.XSmall}
            />
          </Tooltip>
        </>
      )}
    </Chip>
  );
};

const PostTagListInner = ({ post }: PostTagListProps): ReactElement => {
  const { onFollowTag, tags } = useFollowPostTags({ post });
  const { isTagSponsored } = useBrandSponsorship();

  const firstSponsoredTag = useMemo(() => {
    return tags.all.find((tag) => isTagSponsored(tag)) || null;
  }, [tags.all, isTagSponsored]);

  if (!tags.all.length) {
    return null;
  }

  const followedSet = new Set(tags.followed);

  return (
    <ul aria-label="Post tags" className="flex flex-wrap items-center gap-2">
      {tags.all.map((tag) => (
        <PostTagItem
          key={tag}
          tag={tag}
          isFollowed={followedSet.has(tag)}
          onFollow={onFollowTag}
          disableBranding={tag !== firstSponsoredTag}
        />
      ))}
    </ul>
  );
};

export const PostTagList = memo(
  PostTagListInner,
  (prev, next) => prev.post?.tags?.join() === next.post?.tags?.join(),
);
