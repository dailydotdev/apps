import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { EditIcon } from '../icons';
import { IconSize } from '../Icon';

interface BookmarkNoteStripProps {
  note: string;
  className?: string;
}

/**
 * The user's own note on a bookmark, kept to two lines so the card stays a
 * card. The clamp sits on the text node: `line-clamp` cannot share an element
 * with `flex`, and the global `flex-shrink: 0` needs `min-w-0` to let it wrap.
 */
export const BookmarkNoteStrip = ({
  note,
  className,
}: BookmarkNoteStripProps): ReactElement => (
  <p
    className={classNames(
      'flex items-start gap-1 rounded-8 bg-action-plus-float px-2 py-1 text-action-plus-default typo-footnote',
      className,
    )}
  >
    <EditIcon size={IconSize.XSmall} className="mt-0.5 shrink-0" aria-hidden />
    <span className="line-clamp-2 min-w-0 flex-1 break-words">{note}</span>
  </p>
);
