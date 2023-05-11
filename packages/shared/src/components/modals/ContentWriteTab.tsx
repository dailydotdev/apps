import React, { ReactElement } from 'react';
import { Modal } from './common/Modal';
import CommentBox, { CommentBoxProps } from './CommentBox';
import { Justify } from '../utilities';
import { Button, ButtonSize } from '../buttons/Button';
import AtIcon from '../icons/At';
import { ClickableText } from '../buttons/ClickableText';
import { markdownGuide } from '../../lib/constants';
import { useUserMention } from '../../hooks/useUserMention';
import { Post } from '../../graphql/posts';

interface ContentWriteTabProps
  extends Omit<CommentBoxProps, 'useUserMentionOptions'> {
  post: Post;
  tabName: string;
}

function ContentWriteTab({
  post,
  tabName,
  children,
  ...props
}: ContentWriteTabProps): ReactElement {
  const userMentionData = useUserMention({
    postId: post.id,
    sourceId: post.source.id,
    onInput: props.onInput,
  });

  return (
    <>
      <Modal.Body view={tabName}>
        <CommentBox {...props} useUserMentionOptions={userMentionData} />
      </Modal.Body>
      <Modal.Footer justify={Justify.Between} view={tabName}>
        <Button
          className="btn-tertiary"
          buttonSize={ButtonSize.Small}
          icon={<AtIcon />}
          onClick={userMentionData.onInitializeMention}
        />
        <div className="-ml-2 w-px h-6 border border-opacity-24 border-theme-divider-tertiary" />
        <ClickableText
          tag="a"
          href={markdownGuide}
          className="typo-caption1"
          defaultTypo={false}
          target="_blank"
        >
          Markdown supported
        </ClickableText>
        {children}
      </Modal.Footer>
    </>
  );
}

export default ContentWriteTab;
