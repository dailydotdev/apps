import React, { ReactElement, useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import MenuIcon from '../../../icons/menu.svg';
import { Roles } from '../../lib/user';
import AuthContext from '../../contexts/AuthContext';
import { Post } from '../../graphql/posts';
import useNotification from '../../hooks/useNotification';
import useReportPostMenu from '../../hooks/useReportPostMenu';
import classed from '../../lib/classed';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';
import { CardNotification } from '../cards/Card';
import { LazyImage } from '../LazyImage';
import { ProfileLink } from '../profile/ProfileLink';
import { Button } from '../buttons/Button';
import PostOptionsMenu from '../PostOptionsMenu';

interface PostHeaderProps {
  post: Post;
}

const Container = classed('div', 'flex items-center mb-2');
const SourceImage = classed(LazyImage, 'w-8 h-8 rounded-full');
const SourceName = classed(
  'div',
  'text-theme-label-primary font-bold typo-callout',
);

const BanPostModal = dynamic(() => import('../modals/BanPostModal'));

const DeletePostModal = dynamic(() => import('../modals/DeletePostModal'));

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
