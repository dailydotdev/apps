import React, { ReactElement, useContext, useState } from 'react';
import { Post } from '@dailydotdev/shared/src/graphql/posts';
import { SimpleTooltip } from '@dailydotdev/shared/src/components/tooltips/SimpleTooltip';
import { LinkWithTooltip } from '@dailydotdev/shared/src/components/tooltips/LinkWithTooltip';
import useNotification from '@dailydotdev/shared/src/hooks/useNotification';
import useReportPostMenu from '@dailydotdev/shared/src/hooks/useReportPostMenu';
import { CardNotification } from '@dailydotdev/shared/src/components/cards/Card';
import classed from '@dailydotdev/shared/src/lib/classed';
import { LazyImage } from '@dailydotdev/shared/src/components/LazyImage';
import { ProfileLink } from '@dailydotdev/shared/src/components/profile/ProfileLink';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import MenuIcon from '@dailydotdev/shared/icons/menu.svg';
import PostOptionsMenu from '@dailydotdev/shared/src/components/PostOptionsMenu';
import { Roles } from '@dailydotdev/shared/src/lib/user';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import dynamic from 'next/dynamic';

interface PostHeaderProps {
  post: Post;
}

const Container = classed('div', 'flex items-center mb-2');
const SourceImage = classed(LazyImage, 'w-8 h-8 rounded-full');
const SourceName = classed(
  'div',
  'text-theme-label-primary font-bold typo-callout',
);

const BanPostModal = dynamic(
  () => import('@dailydotdev/shared/src/components/modals/BanPostModal'),
);

const DeletePostModal = dynamic(
  () => import('@dailydotdev/shared/src/components/modals/DeletePostModal'),
);

export function PostHeader({ post }: PostHeaderProps): ReactElement {
  const { id, author, source } = post;
  const { user } = useContext(AuthContext);
  const { notification, onMessage } = useNotification();
  const { showReportMenu } = useReportPostMenu();
  const [showBanPost, setShowBanPost] = useState(false);
  const [showDeletePost, setShowDeletePost] = useState(false);

  const showPostOptionsContext = (e) => {
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    showReportMenu(e, {
      position: { x: right, y: bottom + 4 },
    });
  };

  if (notification) {
    return (
      <Container>
        <CardNotification className="flex-1 py-2.5 text-center">
          {notification}
        </CardNotification>
      </Container>
    );
  }

  const isModerator = user?.roles?.indexOf(Roles.Moderator) > -1;

  return (
    <Container className="flex items-center mb-2">
      <LinkWithTooltip
        href={`/sources/${source.id}`}
        passHref
        prefetch={false}
        tooltip={{
          placement: 'bottom',
          content: source.name,
        }}
      >
        <SourceImage
          className="cursor-pointer"
          imgSrc={source.image}
          imgAlt={source.name}
          background="var(--theme-background-secondary)"
        />
      </LinkWithTooltip>
      {author ? (
        <ProfileLink
          user={author}
          data-testid="authorLink"
          className="flex-1 mr-auto ml-2"
        >
          <SourceImage
            imgSrc={author.image}
            imgAlt={author.name}
            background="var(--theme-background-secondary)"
          />
          <SourceName className="flex-1 ml-2">{author.name}</SourceName>
        </ProfileLink>
      ) : (
        <div className="flex flex-col flex-1 mx-2">
          <SourceName>{source.name}</SourceName>
        </div>
      )}
      <SimpleTooltip placement="left" content="Options">
        <Button
          className="right-4 my-auto btn-tertiary"
          style={{ position: 'absolute' }}
          icon={<MenuIcon />}
          onClick={(event) => showPostOptionsContext(event)}
          buttonSize="small"
        />
      </SimpleTooltip>
      <PostOptionsMenu
        post={post}
        onMessage={onMessage}
        setShowBanPost={isModerator ? () => setShowBanPost(true) : null}
        setShowDeletePost={isModerator ? () => setShowDeletePost(true) : null}
      />
      {showBanPost && (
        <BanPostModal
          postId={id}
          isOpen={showBanPost}
          onRequestClose={() => setShowBanPost(false)}
        />
      )}
      {showDeletePost && (
        <DeletePostModal
          postId={id}
          isOpen={showDeletePost}
          onRequestClose={() => setShowDeletePost(false)}
        />
      )}
    </Container>
  );
}
