import React, {
  ReactElement,
  MouseEvent,
  useState,
  useRef,
  useMemo,
  SetStateAction,
  Dispatch,
} from 'react';
import { Radio, RadioOption } from '../fields/Radio';
import { Post } from '../../graphql/posts';
import { Checkbox } from '../fields/Checkbox';
import { Button, ButtonSize } from '../buttons/Button';
import { PostBootData } from '../../lib/boot';
import { Modal, ModalProps } from './common/Modal';
import { FlexRow } from '../utilities';

export interface Props extends ModalProps {
  postIndex: number;
  post: Post | PostBootData;
  onReport: (postIndex, postId, reason, comment, blockSource, tags) => unknown;
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
              className={isSelected ? 'btn-primary' : 'btn-tag'}
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

export default function ReportPostModal({
  postIndex,
  post,
  onReport,
  ...props
}: Props): ReactElement {
  const [reason, setReason] = useState(null);
  const [comment, setComment] = useState<string>();
  const inputRef = useRef<HTMLInputElement>();
  const [selectedTags, setSelectedTags] = useState<string[]>(() => []);
  const reportOptionsForActiveReason = useMemo<RadioOption[]>(() => {
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
        };
      }

      return reportReason;
    });
  }, [reason, post, selectedTags]);

  const onReportPost = async (event: MouseEvent): Promise<void> => {
    onReport(
      postIndex,
      post,
      reason,
      comment,
      inputRef.current?.checked,
      selectedTags,
    );
    props.onRequestClose(event);
  };

  return (
    <Modal
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={props.onRequestClose}
      {...props}
    >
      <Modal.Header title="Report post" />
      <Modal.Body>
        <p className="mb-6 text-theme-label-tertiary typo-callout">
          &quot;{post?.title}&quot;
        </p>
        <Radio
          className={{ container: 'mt-2 mb-4' }}
          name="report_reason"
          options={reportOptionsForActiveReason}
          value={reason}
          onChange={setReason}
        />
        <textarea
          onChange={(event) => setComment(event.target.value)}
          className="self-stretch p-2 mb-4 w-full h-20 bg-theme-float rounded-10 resize-none typo-body"
          data-testid="report_comment"
        />
        <Checkbox ref={inputRef} name="blockSource" className="font-normal">
          Don&apos;t show posts from {post?.source?.name}
        </Checkbox>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="btn-primary"
          disabled={
            !reason ||
            (reason === 'OTHER' && !comment) ||
            (reason === 'IRRELEVANT' && selectedTags.length === 0)
          }
          onClick={onReportPost}
        >
          Submit report
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
