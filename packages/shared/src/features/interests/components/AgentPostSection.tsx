import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import Markdown from '../../../components/Markdown';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { TextField } from '../../../components/fields/TextField';
import { AiIcon, EditIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { DateFormat } from '../../../components/utilities/DateFormat';
import { TimeFormatType } from '../../../lib/dateFormat';
import type { InterestPost } from '../../../graphql/interests';
import { useAgent } from '../AgentContext';
import { mockRevisionNote } from '../mock';

const rewriteActions = [
  { label: 'Make it shorter', command: 'Rewrite this post, make it shorter' },
  {
    label: 'More technical',
    command: 'Rewrite this post with more technical depth',
  },
  {
    label: 'Add sources',
    command: 'Rewrite this post and link the sources you used',
  },
];

const AgentPostCard = ({ post }: { post: InterestPost }): ReactElement => {
  const { runCommand, isTargetWorking } = useAgent();
  const [isRefining, setRefining] = useState(false);
  const [note, setNote] = useState('');
  const [revision, setRevision] = useState<string>();
  const isBusy = isTargetWorking(post.id);

  const onRefine = (text: string) => {
    runCommand({
      text: `${text} (post: "${post.title}")`,
      label: 'Rewriting the post',
      targetId: post.id,
      onComplete: () => setRevision(mockRevisionNote(text)),
    });
    setRefining(false);
    setNote('');
  };

  return (
    <FlexCol
      className={classNames(
        'gap-3 rounded-16 border p-4 transition-colors',
        isBusy
          ? 'border-brand-default bg-action-bookmark-float'
          : 'border-border-subtlest-tertiary',
      )}
    >
      <FlexRow className="items-center gap-2">
        <AiIcon
          size={IconSize.Small}
          className={classNames(
            'text-brand-default',
            isBusy && 'animate-pulse',
          )}
        />
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Written by your agent ·{' '}
          <DateFormat date={post.createdAt} type={TimeFormatType.Post} />
        </Typography>
        {revision && (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Brand}
            bold
            className="ml-auto"
          >
            Updated just now
          </Typography>
        )}
      </FlexRow>

      <Typography type={TypographyType.Title3} bold>
        {post.title}
      </Typography>

      {isBusy ? (
        <FlexCol className="gap-2">
          {[0, 1, 2].map((line) => (
            <span
              key={line}
              className={classNames(
                'h-3 animate-pulse rounded-6 bg-surface-float',
                line === 2 ? 'w-2/3' : 'w-full',
              )}
            />
          ))}
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Agent is rewriting this post…
          </Typography>
        </FlexCol>
      ) : (
        <Markdown content={`${revision ?? ''}${post.contentHtml ?? ''}`} />
      )}

      <FlexRow className="flex-wrap items-center gap-2 border-t border-border-subtlest-tertiary pt-3">
        {rewriteActions.map(({ label, command }) => (
          <Button
            key={label}
            size={ButtonSize.XSmall}
            variant={ButtonVariant.Float}
            disabled={isBusy}
            onClick={() => onRefine(command)}
          >
            {label}
          </Button>
        ))}
        <Button
          icon={<EditIcon />}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          className="ml-auto"
          disabled={isBusy}
          onClick={() => setRefining((current) => !current)}
        >
          Tell it what to fix
        </Button>
      </FlexRow>

      {isRefining && (
        <FlexRow className="items-center gap-2">
          <TextField
            className={{ container: 'flex-1' }}
            inputId={`refine-${post.id}`}
            name={`refine-${post.id}`}
            label="What should change?"
            placeholder="e.g. cut the intro, lead with the benchmarks"
            value={note}
            valueChanged={setNote}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && note.trim()) {
                event.preventDefault();
                onRefine(note.trim());
              }
            }}
          />
          <Button
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
            disabled={!note.trim()}
            onClick={() => onRefine(note.trim())}
          >
            Send
          </Button>
        </FlexRow>
      )}
    </FlexCol>
  );
};

export const AgentPostSection = ({
  posts,
  isPending,
}: {
  posts: InterestPost[];
  isPending: boolean;
}): ReactElement => {
  const { runCommand } = useAgent();

  if (isPending) {
    return (
      <Typography color={TypographyColor.Tertiary}>Loading posts…</Typography>
    );
  }

  if (!posts.length) {
    return (
      <FlexCol className="items-start gap-3 py-4">
        <Typography color={TypographyColor.Tertiary}>
          The agent hasn&apos;t written anything yet.
        </Typography>
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          onClick={() =>
            runCommand({
              text: 'Write me a post summarising what you found',
              label: 'Writing a post',
            })
          }
        >
          Ask it to write one
        </Button>
      </FlexCol>
    );
  }

  return (
    <FlexCol className="gap-4">
      {posts.map((post) => (
        <AgentPostCard key={post.id} post={post} />
      ))}
    </FlexCol>
  );
};
