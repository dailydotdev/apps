import React, {
  ReactElement,
  MouseEvent,
  useState,
  useRef,
  SetStateAction,
  Dispatch,
  useCallback,
} from 'react';
import { RadioOption } from '../../fields/Radio';
import { Post, ReportReason } from '../../../graphql/posts';
import { Checkbox } from '../../fields/Checkbox';
import { Button, ButtonSize } from '../../buttons/Button';
import { PostBootData } from '../../../lib/boot';
import { ModalProps } from '../common/Modal';
import { FlexRow } from '../../utilities';
import useReportPost from '../../../hooks/useReportPost';
import { postAnalyticsEvent } from '../../../lib/feed';
import { Origin } from '../../../lib/analytics';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { ReportModal } from './ReportModal';

interface OptionalProps {
  index?: number;
  shouldBlockSource?: boolean;
}

export type ReportedCallback = (
  post: Post | PostBootData,
  options: OptionalProps,
) => void;

interface Props extends ModalProps {
  index?: number;
  origin: Origin;
  post: Post | PostBootData;
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
      post: Post;
      selectedTags: string[];
      setSelectedTags: Dispatch<SetStateAction<string[]>>;
    }) => ReactElement
  >
> = {
  IRRELEVANT: ({ post, selectedTags, setSelectedTags }) => {
    return (
      <FlexRow className="flex-wrap gap-2 my-4">
        {post.tags?.map((tag) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <Button
              key={tag}
              className={isSelected ? 'btn-primary' : 'btn-tertiaryFloat'}
              buttonSize={ButtonSize.Small}
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
  const { trackEvent } = useAnalyticsContext();
  const inputRef = useRef<HTMLInputElement>();
  const [selectedTags, setSelectedTags] = useState<string[]>(() => []);
  const reportOptionsForActiveReason = useCallback(
    (reason) => {
      return reportReasons.map((reportReason) => {
        const LabelComponent =
          reportReason.value === reason && reportReasonsMap[reportReason.value];

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
          } as RadioOption;
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
    comment: string,
  ): Promise<void> => {
    const { successful } = await reportPost({
      id: post.id,
      reason,
      comment,
      tags: selectedTags,
    });

    if (!successful) return;

    trackEvent(postAnalyticsEvent('report post', post, { extra: { origin } }));

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
      title={`"${post?.title}"`}
      footer={
        <Checkbox ref={inputRef} name="blockSource" className="font-normal">
          Don&apos;t show posts from {post?.source?.name}
        </Checkbox>
      }
    />
  );
}

export default ReportPostModal;
