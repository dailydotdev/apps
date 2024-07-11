import React, {
  ReactElement,
  MouseEvent,
  useState,
  useRef,
  SetStateAction,
  Dispatch,
  useCallback,
} from 'react';
import { RadioItemProps } from '../../fields/Radio';
import { Post, ReadHistoryPost, ReportReason } from '../../../graphql/posts';
import { Checkbox } from '../../fields/Checkbox';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { PostBootData } from '../../../lib/boot';
import { ModalProps } from '../common/Modal';
import { FlexRow } from '../../utilities';
import useReportPost from '../../../hooks/useReportPost';
import { postLogEvent } from '../../../lib/feed';
import { Origin } from '../../../lib/log';
import { useLogContext } from '../../../contexts/LogContext';
import { ReportModal } from './ReportModal';

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
}

const reportReasons: { value: string; label: string }[] = [
  { value: 'IRRELEVANT', label: 'The post is not about...' },
  { value: 'BROKEN', label: 'Broken link' },
  { value: 'CLICKBAIT', label: 'Clickbait' },
  { value: 'LOW', label: 'Low-quality content' },
  { value: 'NSFW', label: 'NSFW' },
  { value: 'OTHER', label: 'Other' },
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

    logEvent(postLogEvent('report post', post, { extra: { origin } }));

    if (typeof onReported === 'function') {
      onReported(post, { index, shouldBlockSource: inputRef.current?.checked });
    }

    props.onRequestClose(event);
  };

  return (
    <ReportModal
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
