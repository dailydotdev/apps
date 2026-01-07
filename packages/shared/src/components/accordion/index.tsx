import type { MouseEventHandler, ReactElement, ReactNode } from 'react';
import React, { useId, useState } from 'react';
import './style.css';
import classNames from 'classnames';
import {
  Accordion as AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionHeader,
} from '@radix-ui/react-accordion';
import { Button } from '../buttons/Button';
import { ArrowIcon } from '../icons';

interface AccordionProps {
  title: ReactNode;
  children: ReactNode;
  initiallyOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: {
    button?: string;
  };
  disabled?: boolean;
}

const RadixAccordionHeader = ({ children }: { children: ReactNode }) => {
  return (
    <AccordionHeader className="AccordionHeader">
      <AccordionTrigger className="AccordionTrigger">
        {children}
        <ArrowIcon className="AccordionChevron" />
      </AccordionTrigger>
    </AccordionHeader>
  );
};

type RadixAccordionProps = {
  items: { title: string; description: string | ReactNode }[];
  className?: string;
};
export const RadixAccordion = ({
  items,
  className = 'bg-surface-float',
}: RadixAccordionProps) => {
  return (
    <AccordionRoot
      className={classNames('AccordionRoot', className)}
      type="single"
      collapsible
    >
      {items?.map((item) => (
        <AccordionItem
          className="AccordionItem"
          value={item.title}
          key={item.title}
        >
          <RadixAccordionHeader>{item.title}</RadixAccordionHeader>
          <AccordionContent className="AccordionContent">
            <div className="AccordionContentText">{item.description}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </AccordionRoot>
  );
};

export function Accordion({
  title,
  children,
  onClick,
  initiallyOpen = false,
  isOpen: controlledIsOpen,
  onOpenChange,
  className,
  disabled = false,
}: AccordionProps): ReactElement {
  const [internalIsOpen, setInternalIsOpen] = useState(initiallyOpen);
  const id = useId();
  const contentId = `accordion-content-${id}`;

  // Use controlled state if provided, otherwise use internal state
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const isOpenAndEnabled = isOpen && !disabled;

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (disabled) {
      return;
    }

    onClick?.(e);

    const newIsOpen = !isOpen;
    if (!isControlled) {
      setInternalIsOpen(newIsOpen);
    }
    onOpenChange?.(newIsOpen);
  };

  return (
    <div className="flex w-full flex-col">
      <Button
        aria-controls={contentId}
        aria-expanded={isOpenAndEnabled}
        className={classNames(
          'flex w-full flex-row gap-4 !px-0 text-left',
          disabled && '!cursor-default',
          className?.button,
        )}
        type="button"
        onClick={handleClick}
      >
        <div className="min-w-0 flex-1">{title}</div>
        <ArrowIcon
          className={classNames('transition-transform ease-in-out', {
            'rotate-180': !isOpenAndEnabled,
          })}
        />
      </Button>
      <div
        aria-hidden={!isOpenAndEnabled}
        className={classNames(
          'flex h-full min-h-0 w-full flex-col overflow-y-hidden break-words transition-[max-height,margin] duration-300 ease-in-out',
          isOpenAndEnabled ? 'mt-3 max-h-full' : 'max-h-0',
        )}
        id={contentId}
      >
        <div
          className={classNames(
            'transition-transform duration-150 ease-in-out',
            isOpenAndEnabled
              ? 'translate-y-0 opacity-100'
              : '-translate-y-2 opacity-0',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
