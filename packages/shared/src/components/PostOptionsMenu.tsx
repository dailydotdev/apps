import React, { ReactElement, useState } from 'react';
import { Item } from 'react-contexify';
import dynamic from 'next/dynamic';
import useReportPost from '../hooks/useReportPost';
import { Post, ReportReason } from '../graphql/posts';
import EyeIcon from '../../icons/eye.svg';
import ShareIcon from '../../icons/share.svg';
import BlockIcon from '../../icons/block.svg';
import FlagIcon from '../../icons/flag.svg';
import RepostPostModal from './modals/ReportPostModal';

const PortalMenu = dynamic(() => import('./fields/PortalMenu'), {
  ssr: false,
});

export type PostOptionsMenuProps = {
  post: Post;
  onHidden?: () => unknown;
  onReportPost?: (id) => Promise<void>;
  onHidePost?: () => Promise<unknown>;
};

const MenuIcon = ({ Icon }) => {
  return <Icon className="text-2xl mr-2" />;
};

export default function PostOptionsMenu({
  post,
  onHidden,
  onReportPost,
  onHidePost,
}: PostOptionsMenuProps): ReactElement {
  console.log(post);
  const { reportPost, hidePost } = useReportPost();

  const onLocalReportPost = async (reason: ReportReason): Promise<void> => {
    const promise = reportPost({
      id: postId,
      reason,
    });
    await Promise.all([promise, onReportPost?.(reason)]);
  };

  const onLocalHidePost = async (): Promise<void> => {
    console.log('hide', post.id);
    const promise = hidePost(post.id);
    await Promise.all([promise, onHidePost?.()]);
  };

  const postOptions = [
    {
      icon: <MenuIcon Icon={EyeIcon} />,
      text: 'Hide',
      action: () => onLocalHidePost(),
    },
    { icon: <MenuIcon Icon={ShareIcon} />, text: 'Share article' },
    {
      icon: <MenuIcon Icon={BlockIcon} />,
      text: `Don't show articles from ${post?.source?.name}`,
    },
  ];
  post?.tags.forEach((tag) =>
    postOptions.push({
      icon: <MenuIcon Icon={BlockIcon} />,
      text: `Not interested in #${tag}`,
    }),
  );
  postOptions.push({
    icon: <MenuIcon Icon={FlagIcon} />,
    text: 'Report',
    action: () => onReportPost(post?.id),
  });

  return (
    <>
      <PortalMenu
        id="post-context"
        className="menu-primary"
        animation="fade"
        onHidden={onHidden}
      >
        {postOptions.map(({ icon, text, action }) => (
          <Item key={text} className="typo-callout" onClick={action}>
            <a className="flex w-full typo-callout">
              {icon} {text}
            </a>
          </Item>
        ))}
      </PortalMenu>
    </>
  );
}
