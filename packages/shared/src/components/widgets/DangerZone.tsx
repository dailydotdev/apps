import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { AlertBackground } from '../alert/common';

interface DangerZoneProps {
  title: string;
  notes: string[];
  important: ReactNode;
  children?: ReactNode;
  cta: string;
  onClick: () => void;
  className?: string;
}

export function DangerZone({
  title,
  notes,
  important,
  cta,
  className,
  onClick,
  children,
}: DangerZoneProps): ReactElement {
  return (
    <section
      className={classNames(
        'relative flex flex-col overflow-hidden rounded-26 border border-status-error px-6 py-4',
        className,
      )}
    >
      <AlertBackground className="bg-overlay-quaternary-ketchup" />
      <div className="text-text-tertiary typo-callout">
        {title}
        <br />
        <br />
        <ol>
          {notes.map((note, index) => (
            <li key={note}>{`${index + 1}. ${note}`}</li>
          ))}
        </ol>
        <br />
        {important}
      </div>
      {children}
      <Button
        onClick={onClick}
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Ketchup}
        className="mt-6 self-start"
      >
        {cta}
      </Button>
    </section>
  );
}
