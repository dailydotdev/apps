import React, { ReactElement } from 'react';
import { Item } from 'react-contexify';
import dynamic from 'next/dynamic';
import useReportPost from '../hooks/useReportPost';
import { ReportReason } from '../graphql/posts';

const PortalMenu = dynamic(() => import('./fields/PortalMenu'), {
  ssr: false,
});

export type ReportPostMenuProps = {
  postId: string;
  onHidden?: () => unknown;
  onReportPost?: (reason: ReportReason) => Promise<unknown>;
  onHidePost?: () => Promise<unknown>;
};

const reportReasons: { code: ReportReason; text: string }[] = [
  { code: 'BROKEN', text: 'Broken link' },
  { code: 'CLICKBAIT', text: 'Report clickbait' },
  { code: 'LOW', text: 'Low-quality content' },
  { code: 'NSFW', text: 'Report NSFW' },
];

export default function ReportPostMenu({
  postId,
  onHidden,
  onReportPost,
  onHidePost,
}: ReportPostMenuProps): ReactElement {
  const { reportPost, hidePost } = useReportPost();

  const onLocalReportPost = async (reason: ReportReason): Promise<void> => {
    const promise = reportPost({
      id: postId,
      reason,
    });
    await Promise.all([promise, onReportPost?.(reason)]);
  };

  const onLocalHidePost = async (): Promise<void> => {
    const promise = hidePost(postId);
    await Promise.all([promise, onHidePost?.()]);
  };

  return (
    <PortalMenu
      id="post-context"
      className="menu-primary"
      animation="fade"
      onHidden={onHidden}
    >
      {reportReasons.map(({ code, text }) => (
        <Item key={code} onClick={() => onLocalReportPost(code)}>
          {text}
        </Item>
      ))}
      <Item onClick={onLocalHidePost}>Hide post</Item>
    </PortalMenu>
  );
}
