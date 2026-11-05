import type { ReactElement } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import { Button, ButtonVariant } from '../buttons/Button';
import { PickRow } from './PickRow';
import { PICKS_MAX_ITEMS, getPicksPath } from '../../graphql/picks';
import type { Origin } from '../../lib/log';
import {
  PICKS_LIMIT_HINT,
  usePicksEditor,
} from '../../hooks/picks/usePicksEditor';

interface PicksEditorProps {
  origin?: Origin;
}

export function PicksEditor({ origin }: PicksEditorProps): ReactElement | null {
  const editor = usePicksEditor({ origin });
  const { selectedIds, isEdit, currentPicks } = editor;

  if (editor.isLoading) {
    return null;
  }

  if (editor.isError) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
        <h1 className="font-bold typo-title2">Could not load your picks</h1>
        <p className="text-text-tertiary typo-body">
          Something went wrong on our side. Give it another try.
        </p>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          onClick={editor.retry}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (editor.isEmpty) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
        <h1 className="font-bold typo-title2">Nothing to pick yet this week</h1>
        <p className="text-text-tertiary typo-body">
          Read, upvote or bookmark a few posts and come back.
        </p>
        <Link href="/" passHref>
          <Button tag="a" variant={ButtonVariant.Primary}>
            Back to feed
          </Button>
        </Link>
      </div>
    );
  }

  const submit = (
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      disabled={!selectedIds.length}
      loading={editor.isPublishing}
      onClick={editor.publish}
      className="w-full laptop:w-auto"
    >
      Done, share my picks
    </Button>
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pb-24 pt-4 laptop:pb-8">
      <header className="flex flex-col gap-2 laptop:flex-row laptop:items-start laptop:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold typo-title2">
            {isEdit ? "Edit this week's picks" : 'Weekly picks'}
          </h1>
          <p className="text-text-tertiary typo-callout">
            Pick up to {PICKS_MAX_ITEMS} posts from this week and share them
            with one link.
          </p>
          {currentPicks && (
            <Link href={getPicksPath(currentPicks.id)} passHref>
              <a className="text-text-link typo-callout">View your page</a>
            </Link>
          )}
          <p className="font-bold text-text-secondary typo-footnote">
            {selectedIds.length} of {PICKS_MAX_ITEMS} selected
          </p>
          {editor.showLimitHint && (
            <p role="status" className="text-status-error typo-footnote">
              {PICKS_LIMIT_HINT}
            </p>
          )}
        </div>
        <div className="hidden laptop:block">{submit}</div>
      </header>
      <ul className="flex flex-col gap-2">
        {editor.rows.map((row) => (
          <PickRow
            key={row.post.id}
            row={row}
            selected={editor.isSelected(row.post.id)}
            note={editor.notes[row.post.id] ?? ''}
            onToggle={editor.toggle}
            onNoteChange={editor.setNote}
            onNoteBlur={editor.commitNote}
          />
        ))}
      </ul>
      <div className="fixed inset-x-0 bottom-0 z-3 border-t border-border-subtlest-tertiary bg-background-default px-4 pt-3 pb-safe-or-3 laptop:hidden">
        {submit}
      </div>
    </div>
  );
}
