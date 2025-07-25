import type { ReactElement, MouseEvent, SetStateAction, Dispatch } from 'react';
import React, { useState, useRef, useCallback } from 'react';
import type { RadioItemProps } from '../../fields/Radio';
import type { Post, ReadHistoryPost } from '../../../graphql/posts';
import { Checkbox } from '../../fields/Checkbox';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import type { PostBootData } from '../../../lib/boot';
import type { ModalProps } from '../common/Modal';
import { FlexRow } from '../../utilities';
import useReportPost from '../../../hooks/useReportPost';
import { postLogEvent } from '../../../lib/feed';
import { LogEvent } from '../../../lib/log';
import type { Origin } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import { ReasonSelectionModal } from './ReasonSelectionModal';
import { ReportReason } from '../../../report';

interface OptionalProps {
  index?: number;
  shouldBlockSource?: boolean;
}

export type ReportedCallback = (
  post: Post | PostBootData | ReadHistoryPost,
  options: OptionalProps,
) => void;

interface Props extends ModalProps {
  index?: number;
  origin: Origin;
  post: Post | PostBootData | ReadHistoryPost;
  onReported?: ReportedCallback;
  isAd?: boolean;
}

const reportReasons: { value: ReportReason; label: string }[] = [
  { value: ReportReason.Irrelevant, label: 'Off-topic or wrong tags' },
  { value: ReportReason.Broken, label: 'Broken link' },
  { value: ReportReason.Clickbait, label: 'Misleading or clickbait' },
  { value: ReportReason.Paywall, label: 'Paywalled or inaccessible content' },
  { value: ReportReason.Low, label: 'Low-quality or AI-generated' },
  { value: ReportReason.Spam, label: 'Spam or scam' },
  { value: ReportReason.Hateful, label: 'Hate speech or harassment' },
  { value: ReportReason.Nsfw, label: 'Inappropriate, explicit, or NSFW' },
  {
    value: ReportReason.Misinformation,
    label: 'Misinformation or politically-oriented',
  },
  { value: ReportReason.Copyright, label: 'Plagiarism or copyright violation' },
  { value: ReportReason.Privacy, label: 'Privacy violation' },
  { value: ReportReason.Other, label: 'Other' },
];

const reportReasonsMap: Partial<
  Record<
    string,
    ({
      post,
      selectedTags,
      setSelectedTags,
    }: {
      post: Post | ReadHistoryPost;
      selectedTags: string[];
      setSelectedTags: Dispatch<SetStateAction<string[]>>;
    }) => ReactElement
  >
> = {
  IRRELEVANT: ({ post, selectedTags, setSelectedTags }) => {
    return (
      <FlexRow className="my-4 flex-wrap gap-2">
        {post.tags?.map((tag) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <Button
              key={tag}
              variant={isSelected ? ButtonVariant.Primary : ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() => {
                if (isSelected) {
                  setSelectedTags(selectedTags.filter((t) => t !== tag));
                } else {
                  setSelectedTags([...selectedTags, tag]);
                }
              }}
            >
              #{tag}
            </Button>
          );
        })}
      </FlexRow>
    );
  },
};

export function ReportPostModal({
  index,
  post,
  origin,
  onReported,
  isAd,
  ...props
}: Props): ReactElement {
  const { logEvent } = useLogContext();
  const inputRef = useRef<HTMLInputElement>();
  const [selectedTags, setSelectedTags] = useState<string[]>(() => []);
  const reportOptionsForActiveReason = useCallback(
    (reason) => {
      return reportReasons
        .filter((reportReason) => {
          if (reportReason.value === 'IRRELEVANT' && post?.tags?.length === 0) {
            return false;
          }
          return reportReason;
        })
        .map((reportReason) => {
          const LabelComponent =
            reportReason.value === reason &&
            reportReasonsMap[reportReason.value];

          if (LabelComponent) {
            return {
              ...reportReason,
              afterElement: (
                <LabelComponent
                  post={post}
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
                />
              ),
            } as RadioItemProps;
          }

          return reportReason;
        });
    },
    [post, selectedTags],
  );

  const { reportPost } = useReportPost();
  const onReportPost = async (
    event: MouseEvent,
    reason: ReportReason,
    text: string,
  ): Promise<void> => {
    const { successful } = await reportPost({
      id: post.id,
      reason,
      comment: text,
      tags: selectedTags,
    });

    if (!successful) {
      return;
    }

    logEvent(
      postLogEvent(LogEvent.ReportPost, post, {
        extra: { origin, reason, comment: text },
        is_ad: isAd,
      }),
    );

    if (typeof onReported === 'function') {
      onReported(post, { index, shouldBlockSource: inputRef.current?.checked });
    }

    props.onRequestClose(event);
  };

  return (
    <ReasonSelectionModal
      {...props}
      isOpen
      onReport={onReportPost}
      reasons={reportOptionsForActiveReason}
      heading="Report post"
      title={post?.title ? `"${post.title}"` : undefined}
      footer={
        <Checkbox ref={inputRef} name="blockSource" className="font-normal">
          Don&apos;t show posts from {post?.source?.name}
        </Checkbox>
      }
    />
  );
}

export default ReportPostModal;
