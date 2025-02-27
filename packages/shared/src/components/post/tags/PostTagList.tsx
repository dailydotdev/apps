import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { useFollowPostTags } from '../../../hooks/feed/useFollowPostTags';
import { TagLinks } from '../../TagLinks';
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
import { SimpleTooltip } from '../../tooltips';

interface PostTagListProps {
  post: Post;
}

interface PostTagItemProps {
  isFollowed: boolean;
  onFollow?: (tag: string) => void;
  tag: string;
}

const Chip = <T extends TypographyTag>({
  children,
  className,
  ...props
}: PropsWithChildren<TypographyProps<T>>) => (
  <Typography
    className={classNames(
      'cursor-pointer rounded-10 border border-border-subtlest-tertiary transition-colors',
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
}: PostTagItemProps): ReactElement => {
  if (isFollowed) {
    return (
      <Link href={getTagPageLink(tag)} passHref prefetch={false}>
        <Chip
          className="px-2 py-1 hover:bg-border-subtlest-tertiary"
          tag={TypographyTag.Link}
        >
          #{tag}
        </Chip>
      </Link>
    );
  }

  return (
    <Chip className="flex items-center bg-surface-float">
      <Link href={getTagPageLink(tag)} passHref>
        <a
          className="inline-block px-2 py-1"
          title={`Check #${tag} posts`}
        >{`#${tag}`}</a>
      </Link>
      <span
        aria-hidden
        className="h-3 translate-y-px rounded-2 border border-border-subtlest-tertiary"
        role="separator"
      />
      <SimpleTooltip content={`Follow #${tag}`}>
        <Button
          icon={<PlusIcon aria-hidden size={IconSize.XSmall} />}
          onClick={() => onFollow(tag)}
          size={ButtonSize.XSmall}
        />
      </SimpleTooltip>
    </Chip>
  );
};

export const PostTagList = ({ post }: PostTagListProps): ReactElement => {
  const { isTagExperiment, onFollowTag, tags } = useFollowPostTags({ post });

  if (!isTagExperiment) {
    return <TagLinks tags={tags.all} />;
  }

  return (
    <div className="flex flex-1 items-center gap-2">
      {tags.followed.map((tag) => (
        <PostTagItem key={`followed-${tag}`} tag={tag} isFollowed />
      ))}
      {tags.notFollowed.map((tag) => (
        <PostTagItem
          isFollowed={false}
          key={`notFollowed-${tag}`}
          onFollow={onFollowTag}
          tag={tag}
        />
      ))}
    </div>
  );
};
