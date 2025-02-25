import type { ReactElement, ReactNode } from 'react';
import React, { useId, useState } from 'react';
import classNames from 'classnames';
import { Button } from '../buttons/Button';
import { ArrowIcon } from '../icons';

interface AccordionProps {
  title: ReactNode;
  children: ReactNode;
}

export function Accordion({ title, children }: AccordionProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const contentId = `accordion-content-${id}`;

  return (
    <div className="flex w-full flex-col">
      <Button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="flex w-full flex-row gap-4 !px-0 text-left"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="min-w-0 flex-1">{title}</div>
        <ArrowIcon
          className={classNames('transition-transform ease-in-out', {
            'rotate-180': !isOpen,
          })}
        />
      </Button>
      <div
        aria-hidden={!isOpen}
        className={classNames(
          'flex h-full min-h-0 w-full flex-col overflow-y-hidden break-words transition-[max-height,margin] duration-300 ease-in-out',
          isOpen ? 'mt-3 max-h-full' : 'max-h-0',
        )}
        id={contentId}
      >
        <div
          className={classNames(
            'transition-transform duration-150 ease-in-out',
            isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
