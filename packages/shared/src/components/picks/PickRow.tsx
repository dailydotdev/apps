import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Checkbox } from '../fields/Checkbox';
import { TextField } from '../fields/TextField';
import { FieldSize } from '../fields/fieldSizes';
import { Image } from '../image/Image';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { PICKS_NOTE_MAX_LENGTH } from '../../graphql/picks';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import type { PickRowData } from '../../hooks/picks/usePicksEditor';

export const getPickSignal = ({
  upvoted,
  bookmarked,
  read,
  post,
}: Omit<PickRowData, 'reason'>): string => {
  const parts: string[] = [];
  if (upvoted) {
    parts.push('▲ upvoted');
  }
  if (bookmarked) {
    parts.push('bookmarked');
  }
  if (read && !upvoted && !bookmarked) {
    parts.push('read');
  }
  if (post.readTime) {
    parts.push(`${post.readTime} min`);
  }
  return parts.join(' · ');
};

interface PickRowProps {
  row: PickRowData;
  selected: boolean;
  note: string;
  onToggle: (row: PickRowData) => void;
  onNoteChange: (postId: string, note: string) => void;
  onNoteBlur: (postId: string) => void;
}

export function PickRow({
  row,
  selected,
  note,
  onToggle,
  onNoteChange,
  onNoteBlur,
}: PickRowProps): ReactElement {
  const { post } = row;
  // iOS Safari zooms into inputs under 16px, so phones get the body size.
  const isLaptop = useViewSize(ViewSize.Laptop);
  const signal = getPickSignal(row);
  const toggle = (): void => onToggle(row);
  // The checkbox is fully controlled by the page state, so a blocked selection
  // (the 6th) can never leave it looking checked.
  const onCheckboxClick = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    toggle();
  };

  return (
    <li
      className={classNames(
        'flex flex-col gap-2 rounded-16 border p-3',
        selected
          ? 'border-accent-cabbage-default bg-surface-float'
          : 'border-border-subtlest-tertiary',
      )}
    >
      <div className="flex items-center gap-3">
        <div onClickCapture={onCheckboxClick}>
          <Checkbox name={`pick-${post.id}`} checked={selected} readOnly>
            <span className="sr-only">{post.title}</span>
          </Checkbox>
        </div>
        <div
          role="presentation"
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
          onClick={toggle}
        >
          <Image
            src={post.image}
            alt=""
            loading="lazy"
            fallbackSrc={cloudinaryPostImageCoverPlaceholder}
            className="size-14 shrink-0 rounded-12 object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="line-clamp-2 font-bold typo-callout">
              {post.title}
            </span>
            {signal && (
              <span className="text-text-tertiary typo-footnote">{signal}</span>
            )}
          </div>
        </div>
      </div>
      {selected && (
        <div className="flex items-center gap-2 pl-10">
          <div className="min-w-0 flex-1">
            <TextField
              inputId={`pick-note-${post.id}`}
              name={`pick-note-${post.id}`}
              label="Why is it worth reading? (optional)"
              fieldSize={isLaptop ? FieldSize.Small : FieldSize.Large}
              maxLength={PICKS_NOTE_MAX_LENGTH}
              showMaxLength={false}
              value={note}
              onInput={(event) =>
                onNoteChange(post.id, event.currentTarget.value)
              }
              onBlur={() => onNoteBlur(post.id)}
            />
          </div>
          <span className="shrink-0 text-text-quaternary typo-footnote">
            {note.length}/{PICKS_NOTE_MAX_LENGTH}
          </span>
        </div>
      )}
    </li>
  );
}
