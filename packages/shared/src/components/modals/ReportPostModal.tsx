import React, { ReactElement, MouseEvent, useState, useRef } from 'react';
import { Radio } from '../fields/Radio';
import { Post } from '../../graphql/posts';
import { ModalCloseButton } from './ModalCloseButton';
import { Checkbox } from '../fields/Checkbox';
import { ModalProps } from './StyledModal';
import { Button } from '../buttons/Button';
import {
  ReportModal,
  ReportHeading,
  ReportDescription,
  ReportButtonsCenter,
} from './ReportModal';
import { PostBootData } from '../../lib/boot';

export interface Props extends ModalProps {
  postIndex: number;
  post: Post | PostBootData;
  onReport: (postIndex, postId, reason, comment, blockSource) => unknown;
}

const reportReasons: { value: string; label: string }[] = [
  { value: 'BROKEN', label: 'Broken link' },
  { value: 'CLICKBAIT', label: 'Clickbait' },
  { value: 'LOW', label: 'Low-quality content' },
  { value: 'NSFW', label: 'NSFW' },
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
    onReport(postIndex, post, reason, comment, inputRef.current?.checked);
    props.onRequestClose(event);
  };

  return (
    <ReportModal {...props}>
      <ModalCloseButton onClick={props.onRequestClose} />
      <ReportHeading>Report article</ReportHeading>
      <ReportDescription>&quot;{post?.title}&quot;</ReportDescription>
      <div className="w-full">
        <Radio
          className="px-2 mt-2 mb-4"
          name="report_reason"
          options={reportReasons}
          value={reason}
          onChange={setReason}
        />
        <div className="-mx-8 h-px bg-theme-divider-secondary" />
        <p className="px-2 mt-6 mb-1 font-bold typo-caption1">
          Anything else you&apos;d like to add?
        </p>
        <textarea
          onChange={(event) => setComment(event.target.value)}
          className="self-stretch p-2 mb-4 w-full h-20 bg-theme-float rounded-10 resize-none typo-body"
        />
        <Checkbox
          ref={inputRef}
          name="blockSource"
          className="self-center mx-2 mb-6 font-normal"
        >
          {`Don't show articles from ${post?.source?.name}`}
        </Checkbox>
      </div>
      <ReportButtonsCenter>
        <Button
          className="flex-1 btn-primary"
          disabled={!reason || (reason === 'OTHER' && !comment)}
          onClick={onReportPost}
        >
          Submit report
        </Button>
      </ReportButtonsCenter>
    </ReportModal>
  );
}
