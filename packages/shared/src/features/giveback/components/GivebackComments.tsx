import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';

interface GivebackComment {
  id: string;
  author: string;
  time: string;
  text: string;
  avatarClass: string;
}

const seedComments: GivebackComment[] = [
  {
    id: 'comment-1',
    author: 'Priya N.',
    time: '2h ago',
    text: 'Love that this costs me nothing but still funds real causes. Backed open source and shared the launch post.',
    avatarClass: 'bg-accent-cabbage-flat text-accent-cabbage-default',
  },
  {
    id: 'comment-2',
    author: 'Marco D.',
    time: '5h ago',
    text: 'Finally a rewards program where the company puts up the money. Picked Girls Who Code — keep it going!',
    avatarClass: 'bg-accent-avocado-flat text-accent-avocado-default',
  },
  {
    id: 'comment-3',
    author: 'Lena S.',
    time: 'Yesterday',
    text: 'Question for the team: will you share the donation receipts publicly? Would love the transparency.',
    avatarClass: 'bg-accent-onion-flat text-accent-onion-default',
  },
];

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const GivebackComments = (): ReactElement => {
  const [comments, setComments] = useState<GivebackComment[]>(seedComments);
  const [draft, setDraft] = useState('');

  const postComment = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }

    setComments((current) => [
      {
        id: `comment-${Date.now()}`,
        author: 'You',
        time: 'Just now',
        text,
        avatarClass: 'bg-accent-bacon-flat text-accent-bacon-default',
      },
      ...current,
    ]);
    setDraft('');
  };

  return (
    <FlexCol className="w-full gap-5">
      <FlexCol className="gap-1">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
          className="uppercase tracking-wider"
        >
          Join the conversation
        </Typography>
        <Typography tag={TypographyTag.H2} type={TypographyType.Title2} bold>
          Comments
        </Typography>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Share why you&apos;re backing Giveback, or ask the team anything.
        </Typography>
      </FlexCol>

      <FlexCol className="gap-2">
        <label htmlFor="giveback-comment" className="flex flex-col gap-2">
          <Typography
            tag={TypographyTag.Span}
            bold
            type={TypographyType.Footnote}
          >
            Add a comment
          </Typography>
          <textarea
            id="giveback-comment"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="What does giving back mean to you?"
            className="min-h-20 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-primary typo-callout"
          />
        </label>
        <FlexRow className="justify-end">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            disabled={!draft.trim()}
            onClick={postComment}
          >
            Post comment
          </Button>
        </FlexRow>
      </FlexCol>

      <FlexCol className="divide-y divide-border-subtlest-tertiary">
        {comments.map((comment) => (
          <FlexRow
            key={comment.id}
            className="items-start gap-3 py-4 first:pt-0"
          >
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold typo-footnote ${comment.avatarClass}`}
            >
              {getInitials(comment.author)}
            </span>
            <FlexCol className="min-w-0 flex-1 gap-1">
              <FlexRow className="items-center gap-2">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Footnote}
                  bold
                >
                  {comment.author}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  {comment.time}
                </Typography>
              </FlexRow>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
              >
                {comment.text}
              </Typography>
            </FlexCol>
          </FlexRow>
        ))}
      </FlexCol>
    </FlexCol>
  );
};
