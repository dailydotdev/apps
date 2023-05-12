import React, { ReactElement, ReactNode } from 'react';
import { Modal } from '../common/Modal';
import CommentBox, { CommentBoxProps } from '../CommentBox';
import { Justify } from '../../utilities';
import { Button, ButtonSize } from '../../buttons/Button';
import AtIcon from '../../icons/At';
import { ClickableText } from '../../buttons/ClickableText';
import { markdownGuide } from '../../../lib/constants';
import { useUserMention } from '../../../hooks/useUserMention';

interface ContentWriteTabProps
  extends Omit<CommentBoxProps, 'useUserMentionOptions'> {
  tabName: string;
  submitAction: ReactNode;
}

function ContentWriteTab({
  tabName,
  children,
  submitAction,
  ...props
}: ContentWriteTabProps): ReactElement {
  const { post } = props.parentComment;
  const userMentionData = useUserMention({
    postId: post.id,
    sourceId: post.source.id,
    onInput: props.onInput,
  });

  return (
    <>
      <Modal.Body view={tabName}>
        <CommentBox {...props} useUserMentionOptions={userMentionData}>
          {children}
        </CommentBox>
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
        {submitAction}
      </Modal.Footer>
    </>
  );
}

export default ContentWriteTab;
