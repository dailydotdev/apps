import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import CloseButton from '../../../../components/CloseButton';
import { VIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { useCopyLink } from '../../../../hooks/useCopy';
import { AgentPromptButton } from '../AgentPromptButton';
import type { ReadinessItem } from '../../lib/readiness';
import {
  isCountedItem,
  ReadinessGroup,
  ReadinessKind,
} from '../../lib/readiness';

interface CompanyPageReadinessProps {
  title: string;
  description: string;
  /**
   * What was missing when the page opened. Rows done since then stay where
   * they are, checked, so nothing moves under the admin's cursor.
   */
  rows: ReadinessItem[];
  /** What was already done when the page opened */
  done: ReadinessItem[];
  /** A row's button. Call `preventDefault` to stay on the page. */
  onClickRow?: (item: ReadinessItem, event: MouseEvent) => void;
  /** A skill's prompt was copied */
  onTrySkill?: (item: ReadinessItem) => void;
  /** The prompt for everything still missing, built when copied */
  getPrompt: () => string;
  onCopyPrompt?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const DONE_COLOR = '#D8B4FE';

const groupTitle: Record<ReadinessGroup, string> = {
  [ReadinessGroup.Page]: 'Your page',
  [ReadinessGroup.Profile]: 'Your profile',
  [ReadinessGroup.Reach]: 'Reach developers',
  [ReadinessGroup.Agent]: 'Use daily.dev from your agent',
  [ReadinessGroup.Included]: 'Already on',
};

const Check = ({ isDone }: { isDone: boolean }): ReactElement => (
  <span
    aria-hidden
    className="flex size-5 shrink-0 items-center justify-center rounded-full"
    style={
      isDone
        ? { background: DONE_COLOR, color: '#111827' }
        : {
            boxShadow:
              'inset 0 0 0 1.5px var(--theme-border-subtlest-secondary)',
          }
    }
  >
    {isDone && <VIcon size={IconSize.Size16} secondary />}
  </span>
);

const RowText = ({ item }: { item: ReadinessItem }): ReactElement => (
  <span className="flex min-w-0 flex-1 flex-col">
    <span className="font-bold typo-callout">{item.title}</span>
    <span className="text-pretty text-text-tertiary typo-footnote">
      {item.hint}
    </span>
  </span>
);

const SkillRow = ({
  item,
  onTry,
}: {
  item: ReadinessItem;
  onTry?: (item: ReadinessItem) => void;
}): ReactElement => {
  const [isCopying, copy] = useCopyLink(() => item.prompt ?? '');

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Check isDone={item.isDone} />
      <RowText item={item} />
      <Button
        type="button"
        variant={item.isDone ? ButtonVariant.Tertiary : ButtonVariant.Float}
        size={ButtonSize.Small}
        className="shrink-0"
        onClick={() => {
          copy();
          onTry?.(item);
        }}
      >
        {isCopying ? 'Copied' : item.cta}
      </Button>
    </li>
  );
};

const Row = ({
  item,
  onClick,
}: {
  item: ReadinessItem;
  onClick?: (item: ReadinessItem, event: MouseEvent) => void;
}): ReactElement => {
  const isIncluded = item.kind === ReadinessKind.Included;

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Check isDone={item.isDone} />
      <RowText item={item} />
      {item.href && (
        <Button
          tag="a"
          href={item.href}
          variant={
            item.isDone && !isIncluded
              ? ButtonVariant.Tertiary
              : ButtonVariant.Float
          }
          size={ButtonSize.Small}
          className="shrink-0"
          onClick={(event: MouseEvent) => onClick?.(item, event)}
        >
          {item.isDone && !isIncluded ? 'Edit' : item.cta}
        </Button>
      )}
    </li>
  );
};

/**
 * For a company page's admins: what's still missing on the page and on their
 * own profile, and on a paid plan what the plan gives them, with a button for
 * each and one prompt that hands the rest to their agent. Gone once everything
 * is in, or once they close it.
 */
export const CompanyPageReadiness = ({
  title,
  description,
  rows,
  done,
  onClickRow,
  onTrySkill,
  getPrompt,
  onCopyPrompt,
  onDismiss,
  className,
}: CompanyPageReadinessProps): ReactElement | null => {
  const counted = rows.filter(isCountedItem);

  if (!counted.length) {
    return null;
  }

  const total = counted.length + done.length;
  const doneCount = done.length + counted.filter(({ isDone }) => isDone).length;

  return (
    <section
      className={classNames(
        'relative flex w-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4 tablet:p-5',
        className,
      )}
    >
      {onDismiss && (
        <CloseButton
          size={ButtonSize.XSmall}
          className="absolute right-3 top-3"
          aria-label="Dismiss"
          onClick={onDismiss}
        />
      )}
      <div className="flex flex-col gap-2">
        <h3
          className={classNames('font-bold typo-title3', onDismiss && 'pr-8')}
        >
          {title}
        </h3>
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
        <p className="text-text-tertiary typo-footnote">{description}</p>
      </div>
      <AgentPromptButton
        getPrompt={getPrompt}
        label="Proceed with your agent"
        hint="Copies a prompt that picks up where you left off. Your agent checks with you before it saves anything."
        copiedHint="Paste it into your agent. It checks with you before it saves anything."
        onCopy={onCopyPrompt}
      />
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
              {groupRows.map((item) =>
                item.kind === ReadinessKind.Skill ? (
                  <SkillRow key={item.id} item={item} onTry={onTrySkill} />
                ) : (
                  <Row key={item.id} item={item} onClick={onClickRow} />
                ),
              )}
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
    </section>
  );
};
