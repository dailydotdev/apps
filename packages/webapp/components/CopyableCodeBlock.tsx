import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CopyIcon } from '@dailydotdev/shared/src/components/icons/Copy';

interface CopyableCodeBlockProps {
  text: string;
  onCopy: () => void | Promise<void>;
  multiline?: boolean;
  codeClassName?: string;
}

export const CopyableCodeBlock = ({
  text,
  onCopy,
  multiline,
  codeClassName,
}: CopyableCodeBlockProps): ReactElement => (
  <div className="flex items-start gap-2 rounded-12 bg-surface-float p-3">
    <code
      className={classNames(
        'min-w-0 flex-1 break-words text-text-tertiary',
        multiline && 'whitespace-pre-wrap',
        codeClassName,
      )}
    >
      {text}
    </code>
    <Button
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      icon={<CopyIcon />}
      onClick={onCopy}
      className="shrink-0"
    />
  </div>
);
