import React, { ReactElement, MouseEvent, useState, useRef } from 'react';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import { BAN_POST_MUTATION, Post } from '../../graphql/posts';
import { apiUrl } from '../../lib/config';
import { Button } from '../buttons/Button';
import { ModalProps } from './StyledModal';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
  ConfirmationButtonsCenter,
} from './ConfirmationModal';
import { EmptyResponse } from '../../graphql/emptyResponse';
import { ModalCloseButton } from './ModalCloseButton';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { Checkbox } from '../fields/Checkbox';

export interface Props extends ModalProps {
  postIndex: number;
  post: Post;
  onReport: (postIndex, postId, reason, comment, blockSource) => unknown;
}

const reportReasons: { value: string; label: string }[] = [
  { value: 'BROKEN', label: 'Broken link' },
  { value: 'CLICKBAIT', label: 'Clickbait' },
  { value: 'LOW', label: 'Low-quality content' },
  { value: 'NSFW', label: 'Report NSFW' },
  { value: 'OTHER', label: 'Other' },
];

export default function RepostPostModal({
  postIndex,
  post,
  onReport,
  ...props
}: Props): ReactElement {
  const [reason, setReason] = useState(null);
  const [comment, setComment] = useState<string>();
  const inputRef = useRef<HTMLInputElement>();

  const onReportPost = async (event: MouseEvent): Promise<void> => {
    onReport(postIndex, post.id, reason, comment, inputRef.current?.checked);
    props.onRequestClose(event);
  };

  return (
    <ConfirmationModal {...props}>
      <ModalCloseButton onClick={props.onRequestClose} />
      <ConfirmationHeading>Report article</ConfirmationHeading>
      <ConfirmationDescription>"{post?.title}"</ConfirmationDescription>
      <div className="w-full">
        <Radio
          className=" mt-2 mb-4"
          name="report_reason"
          options={reportReasons}
          value={reason}
          onChange={setReason}
        />
        <div className="-mx-10 h-px bg-theme-divider-secondary"></div>
        <p className="font-bold typo-caption1 mt-6 mb-1">
          Anything else you'd like to add?
        </p>
        <textarea
          onChange={(event) => setComment(event.target.value)}
          className="self-stretch py-2 px-4 h-20 mt-1 mb-6 w-full bg-theme-float rounded-10 resize-none typo-body"
        />
        <Checkbox
          ref={inputRef}
          name="blockSource"
          className="self-center mb-6 font-normal"
        >
          Don't show articles from {post?.source?.name}
        </Checkbox>
      </div>
      <ConfirmationButtonsCenter>
        <Button
          className="btn-primary"
          disabled={!reason}
          onClick={onReportPost}
        >
          Submit report
        </Button>
      </ConfirmationButtonsCenter>
    </ConfirmationModal>
  );
}
