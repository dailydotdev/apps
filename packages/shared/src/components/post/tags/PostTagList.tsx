import type { PropsWithChildren, ReactElement } from 'react';
import React, { useMemo } from 'react';
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
  if (isFollowed) {
    return (
      <Link href={getTagPageLink(tag)} passHref prefetch={false}>
        <a title={`Check all #${tag} posts`}>
          <BrandedTag
            tag={tag}
            asSpan
            disableBranding={disableBranding}
            className="border px-2 py-1 hover:bg-border-subtlest-tertiary"
          />
        </a>
      </Link>
    );
  }

  return (
    <Chip className="flex items-center bg-surface-float" role="listitem">
      <Link href={getTagPageLink(tag)} passHref prefetch={false}>
        <a title={`Check all #${tag} posts`}>
          <BrandedTag
            tag={tag}
            asSpan
            disableBranding={disableBranding}
            className="!border-0 !bg-transparent !h-auto py-1"
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
        />
      </Tooltip>
    </Chip>
  );
};

export const PostTagList = ({ post }: PostTagListProps): ReactElement => {
  const { onFollowTag, tags } = useFollowPostTags({ post });
  const { isTagSponsored } = useBrandSponsorship();

  // Only allow one tag to show branding - find the first sponsored tag
  const firstSponsoredTag = useMemo(() => {
    return tags.all.find((tag) => isTagSponsored(tag)) || null;
  }, [tags.all, isTagSponsored]);

  if (!tags.all.length) {
    return null;
  }

  return (
    <ul aria-label="Post tags" className="flex flex-wrap items-center gap-2">
      {tags.followed.map((tag) => (
        <PostTagItem
          key={`followed-${tag}`}
          tag={tag}
          isFollowed
          disableBranding={tag !== firstSponsoredTag}
        />
      ))}
      {tags.notFollowed.map((tag) => (
        <PostTagItem
          isFollowed={false}
          key={`notFollowed-${tag}`}
          onFollow={onFollowTag}
          tag={tag}
          disableBranding={tag !== firstSponsoredTag}
        />
      ))}
    </ul>
  );
};
