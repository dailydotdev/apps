import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from './buttons/Button';
import { CopyIcon, VIcon } from './icons';
import { useCopyLink } from '../hooks/useCopy';

const PROMPT_FADE = 'linear-gradient(180deg, #000 55%, transparent)';

/**
 * The code in its box, and what to do with it below the box. A fixed height keeps
 * every client the same size, and long text fades out at the cut.
 */
export const CopyBlock = ({
  text,
  label,
  height,
  isFaded,
  secondary,
  onCopy,
}: {
  text: string;
  label: string;
  height?: number;
  isFaded?: boolean;
  secondary?: ReactNode;
  onCopy: () => void;
}): ReactElement => {
  const [isCopying, copy] = useCopyLink(() => text);

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-16 border border-border-subtlest-tertiary bg-surface-float">
        <pre
          className={classNames(
            'whitespace-pre-wrap break-words p-4 font-mono text-text-secondary typo-footnote',
            isFaded ? 'overflow-hidden' : 'overflow-y-auto',
          )}
          style={{
            height,
            maskImage: isFaded ? PROMPT_FADE : undefined,
            WebkitMaskImage: isFaded ? PROMPT_FADE : undefined,
          }}
        >
          {text}
        </pre>
      </div>
      <div className="flex gap-2">
        <Button
          className="min-w-0 flex-1"
          variant={ButtonVariant.Primary}
          icon={isCopying ? <VIcon /> : <CopyIcon />}
          onClick={() => {
            copy();
            onCopy();
          }}
        >
          {isCopying ? 'Copied' : label}
        </Button>
        {secondary}
      </div>
    </div>
  );
};
