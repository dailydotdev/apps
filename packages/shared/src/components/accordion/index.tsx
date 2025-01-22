import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';

interface AccordionProps {
  title: ReactNode;
  children: ReactNode;
}

export function Accordion({ title, children }: AccordionProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex w-full flex-col">
      <span className="flex w-full flex-row">
        {title}
        <div className="flex flex-1" />
        <Button
          type="button"
          icon={
            <ArrowIcon
              className={classNames('transition-transform ease-in-out', {
                'rotate-180': !isOpen,
              })}
            />
          }
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          onClick={() => setIsOpen(!isOpen)}
        />
      </span>
      <div
        className={classNames(
          'flex h-full min-h-0 w-full flex-col overflow-y-hidden break-words transition-[max-height,margin] duration-300 ease-in-out',
          isOpen ? 'mt-3 max-h-full' : 'max-h-0',
        )}
      >
        {children}
      </div>
    </div>
  );
}
