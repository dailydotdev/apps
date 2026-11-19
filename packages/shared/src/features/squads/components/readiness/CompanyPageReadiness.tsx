import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { agentMarks } from '../checkout/agentMarks';
import { AgentMark } from '../checkout/AgentMark';
import type { ReadinessItem } from '../../lib/readiness';
import { ReadinessGroup } from '../../lib/readiness';

interface CompanyPageReadinessProps {
  /**
   * What was missing when the page opened. Rows done since then stay where
   * they are, checked, so nothing moves under the admin's cursor.
   */
  rows: ReadinessItem[];
  /** What was already done when the page opened */
  done: ReadinessItem[];
  onClickRow?: (item: ReadinessItem) => void;
  isPromptCopied?: boolean;
  onCopyPrompt?: () => void;
  className?: string;
}

const DONE_COLOR = '#D8B4FE';

const shownAgents = [
  agentMarks['claude-code'],
  agentMarks.codex,
  agentMarks.cursor,
];

const groupTitle: Record<ReadinessGroup, string> = {
  [ReadinessGroup.Page]: 'Your page',
  [ReadinessGroup.Profile]: 'Your profile',
};

const Row = ({
  item,
  onClick,
}: {
  item: ReadinessItem;
  onClick?: (item: ReadinessItem) => void;
}): ReactElement => (
  <li className="flex items-center gap-3 py-2.5">
    <span
      aria-hidden
      className="flex size-5 shrink-0 items-center justify-center rounded-full"
      style={
        item.isDone
          ? { background: DONE_COLOR, color: '#111827' }
          : {
              boxShadow:
                'inset 0 0 0 1.5px var(--theme-border-subtlest-secondary)',
            }
      }
    >
      {item.isDone && <VIcon size={IconSize.Size16} secondary />}
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="font-bold typo-callout">{item.title}</span>
      <span className="text-pretty text-text-tertiary typo-footnote">
        {item.hint}
      </span>
    </span>
    <Button
      tag="a"
      href={item.href}
      variant={item.isDone ? ButtonVariant.Tertiary : ButtonVariant.Float}
      size={ButtonSize.Small}
      className="shrink-0"
      onClick={() => onClick?.(item)}
    >
      {item.isDone ? 'Edit' : item.cta}
    </Button>
  </li>
);

/**
 * For a company page's admins: what's still missing on the page and on their
 * own profile, with a button for each and one prompt that hands the rest to
 * their agent. Gone once everything is in.
 */
export const CompanyPageReadiness = ({
  rows,
  done,
  onClickRow,
  isPromptCopied,
  onCopyPrompt,
  className,
}: CompanyPageReadinessProps): ReactElement | null => {
  if (!rows.length) {
    return null;
  }

  const total = rows.length + done.length;
  const doneCount = done.length + rows.filter(({ isDone }) => isDone).length;

  return (
    <section
      className={classNames(
        'flex w-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4 tablet:p-5',
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-bold typo-title3">Level up your look and feel</h3>
        <div className="h-1 w-full overflow-hidden rounded-50 bg-border-subtlest-tertiary">
          <div
            className="h-full rounded-50"
            style={{
              background: DONE_COLOR,
              width: `${(doneCount / total) * 100}%`,
              transition: 'width .4s ease',
            }}
          />
        </div>
        <p className="text-text-tertiary typo-footnote">
          Developers open your page and your profile from every post you write.
        </p>
      </div>
      {Object.values(ReadinessGroup).map((group) => {
        const groupRows = rows.filter((item) => item.group === group);

        if (!groupRows.length) {
          return null;
        }

        return (
          <div key={group} className="flex flex-col">
            <p className="font-bold text-text-tertiary typo-caption1">
              {groupTitle[group]}
            </p>
            <ul className="flex flex-col divide-y divide-border-subtlest-tertiary">
              {groupRows.map((item) => (
                <Row key={item.id} item={item} onClick={onClickRow} />
              ))}
            </ul>
          </div>
        );
      })}
      {!!done.length && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-tertiary typo-footnote">
          {done.map((item) => (
            <span key={item.id} className="flex items-center gap-1">
              <VIcon
                size={IconSize.Size16}
                style={{ color: DONE_COLOR }}
                secondary
              />
              {item.title}
            </span>
          ))}
        </p>
      )}
      <div className="flex flex-col items-start gap-2 border-t border-border-subtlest-tertiary pt-4">
        <Button
          type="button"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Medium}
          onClick={onCopyPrompt}
        >
          <span className="mr-2 flex -space-x-1.5" aria-hidden>
            {shownAgents.map((mark) => (
              <AgentMark
                key={mark.name}
                mark={mark}
                className="size-5 rounded-6 ring-2 ring-background-default"
                glyphClassName="size-3"
              />
            ))}
          </span>
          {isPromptCopied ? 'Prompt copied' : 'Let your agent finish it'}
        </Button>
        <span className="min-w-0 flex-1 text-pretty text-text-tertiary typo-footnote">
          Copies a prompt that picks up where you left off. Your agent checks
          with you before it saves anything.
        </span>
      </div>
    </section>
  );
};
