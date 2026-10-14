import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import ExtensionProviders from '../extension/_providers';
import { HistoryStyles } from './kit';

// Page furniture for the Reader pane review pages. Plain on purpose, so the
// devices are the loudest thing on the page.

export const DocPage = ({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <ExtensionProviders>
    <HistoryStyles />
    <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary laptop:px-10">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-14">
        <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
          <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
            {eyebrow}
          </span>
          <h1 className="max-w-[34ch] font-bold typo-mega3">{title}</h1>
          {intro && (
            <div className="flex max-w-[80ch] flex-col gap-3 text-text-secondary typo-body">
              {intro}
            </div>
          )}
        </header>
        {children}
      </div>
    </div>
  </ExtensionProviders>
);

export const Section = ({
  id,
  title,
  lead,
  children,
}: {
  id?: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <section id={id} className="flex scroll-mt-6 flex-col gap-5">
    <div className="flex flex-col gap-2">
      <h2 className="font-bold typo-title1">{title}</h2>
      {lead && (
        <div className="max-w-[90ch] text-text-secondary typo-callout">
          {lead}
        </div>
      )}
    </div>
    {children}
  </section>
);

export const Callout = ({
  title,
  children,
  tone = 'neutral',
}: {
  title: ReactNode;
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'warn';
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-2 rounded-20 border p-5',
      tone === 'brand' &&
        'border-accent-cabbage-default bg-overlay-float-cabbage',
      tone === 'warn' && 'border-accent-bun-default bg-overlay-float-bun',
      tone === 'neutral' && 'border-border-subtlest-tertiary',
    )}
  >
    <h3 className="font-bold typo-body">{title}</h3>
    <div className="flex flex-col gap-2 text-text-secondary typo-callout">
      {children}
    </div>
  </div>
);

export const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="overflow-x-auto rounded-20 border border-border-subtlest-tertiary">
    <table className="w-full text-left typo-callout">
      <thead>
        <tr className="border-b border-border-subtlest-tertiary text-text-tertiary typo-footnote">
          {head.map((cell) => (
            <th key={cell} className="p-3 font-bold">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="border-b border-border-subtlest-quaternary align-top last:border-0"
          >
            {row.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className={classNames(
                  'p-3',
                  cellIndex === 0
                    ? 'font-bold text-text-primary'
                    : 'text-text-secondary',
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Ok = (): ReactElement => (
  <span className="font-bold text-accent-avocado-default">✓</span>
);

export const Todo = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="font-bold text-accent-bun-default">{children}</span>
);

/** One frozen state: a title, a line on what to check, the device. */
export const StateCard = ({
  title,
  check,
  children,
}: {
  title: string;
  check?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex min-w-0 flex-col gap-3">
    <div className="flex flex-col gap-1">
      <h3 className="font-bold typo-title3">{title}</h3>
      {check && <p className="text-text-tertiary typo-callout">{check}</p>}
    </div>
    {children}
  </div>
);

export type Step = (root: HTMLElement) => void | Promise<void>;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/** Clicks the first match inside the device, if there is one. */
export const click = (root: HTMLElement, selector: string): void => {
  root.querySelector<HTMLElement>(selector)?.click();
};

/** Clicks the first button whose text is `text`. */
export const clickText = (root: HTMLElement, text: string): void => {
  [...root.ownerDocument.querySelectorAll<HTMLElement>('button, a')]
    .find((node) => node.innerText.trim().split('\n')[0] === text)
    ?.click();
};

/** Types into an input the way a person does. */
export const type = (
  root: HTMLElement,
  value: string,
  selector = 'input',
): void => {
  const input = root.querySelector<HTMLInputElement>(selector);
  if (!input) {
    return;
  }
  input.focus();
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

/**
 * Runs a few steps once the page inside has settled, to freeze a state
 * (a menu open, a toast up) the way a person would reach it.
 */
export const Scripted = ({
  steps = [],
  children,
}: {
  steps?: Step[];
  children: ReactNode;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      await wait(1200);
      // eslint-disable-next-line no-restricted-syntax
      for (const step of steps) {
        if (!alive || !ref.current) {
          return;
        }
        // eslint-disable-next-line no-await-in-loop
        await step(ref.current);
        // eslint-disable-next-line no-await-in-loop
        await wait(400);
      }
    })();
    return () => {
      alive = false;
    };
    // The steps run once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div ref={ref}>{children}</div>;
};
