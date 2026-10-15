import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { EditIcon } from '../icons';
import { IconSize } from '../Icon';

interface BookmarkNoteStripProps {
  note: string;
  className?: string;
}

/** The user's own note on a bookmark, kept short so the card stays a card. */
export const BookmarkNoteStrip = ({
  note,
  className,
}: BookmarkNoteStripProps): ReactElement => (
  <p
    className={classNames(
      'mx-2 mb-2 mt-1 line-clamp-2 flex items-start gap-1 rounded-8 bg-action-plus-float px-2 py-1 text-action-plus-default typo-footnote',
      className,
    )}
    title={note}
  >
    <EditIcon size={IconSize.XSmall} className="mt-0.5 shrink-0" aria-hidden />
    <span className="min-w-0">{note}</span>
  </p>
);
