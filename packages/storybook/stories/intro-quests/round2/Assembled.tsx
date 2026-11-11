import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  BellIcon,
  BriefIcon,
  ChromeIcon,
  SearchIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import type { QuestId } from '../data';
import { introQuests, maskedToken, mockUser } from '../data';
import {
  ClaimAllBar,
  CompletionHero,
  HideForever,
  PopupShell,
  ProgressMeter,
  QuestCta,
  QuestDetail,
  RewardTag,
} from '../kit';
import { useSim } from '../sim';

// 10 · Your daily.dev, assembled. Progress is not a bar, it is the product. A
// small daily.dev sits in the popup with a dashed outline where each missing
// piece goes: the new tab, the bell, your brief, your face, your terminal.
// Every quest fills in its piece, so the payoff is visible before you start
// and obvious after. Click a ghost to do that step.

const Ghost = ({
  id,
  focusId,
  onFocus,
  done,
  label,
  className,
  children,
}: {
  id: QuestId;
  focusId: QuestId | null;
  onFocus: (id: QuestId) => void;
  done: boolean;
  label: ReactNode;
  className?: string;
  children: ReactNode;
}): ReactElement => {
  if (done) {
    return <div className={classNames('iq-pop', className)}>{children}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onFocus(id)}
      className={classNames(
        'iq-press flex items-center justify-center gap-1 rounded-10 border border-dashed text-text-quaternary typo-caption2 hover:border-text-tertiary hover:text-text-tertiary',
        focusId === id
          ? 'border-brand-default bg-brand-float text-brand-default'
          : 'border-border-subtlest-secondary',
        className,
      )}
    >
      {label}
    </button>
  );
};

const MiniApp = ({
  focusId,
  onFocus,
}: {
  focusId: QuestId | null;
  onFocus: (id: QuestId) => void;
}): ReactElement => {
  const sim = useSim();
  const ghost = { focusId, onFocus };

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-16 border border-border-subtlest-secondary bg-background-default">
      <div className="flex h-9 shrink-0 items-end gap-1 bg-background-subtle px-2">
        <span className="mb-1.5 flex gap-1">
          <span className="size-2 rounded-max bg-surface-hover" />
          <span className="size-2 rounded-max bg-surface-hover" />
          <span className="size-2 rounded-max bg-surface-hover" />
        </span>
        <Ghost
          id="extension"
          {...ghost}
          done={sim.isDone('extension')}
          label="Your new tab"
          className="ml-2 h-7 w-32"
        >
          <span className="ml-2 flex h-7 w-32 items-center gap-1.5 rounded-t-8 bg-background-default px-2 text-text-primary typo-caption2">
            <LogoIcon className={{ container: 'size-3' }} />
            New Tab
          </span>
        </Ghost>
        {!sim.isDone('extension') && (
          <span className="mb-1.5 ml-1 text-text-quaternary">
            <ChromeIcon size={IconSize.XXSmall} />
          </span>
        )}
      </div>

      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-3">
        <LogoIcon className={{ container: 'size-5' }} />
        <span className="flex h-7 flex-1 items-center gap-1.5 rounded-8 bg-surface-float px-2 text-text-quaternary typo-caption2">
          <SearchIcon size={IconSize.XXSmall} />
          Search
        </span>
        <Ghost
          id="notifications"
          {...ghost}
          done={sim.isDone('notifications')}
          label={<BellIcon size={IconSize.XXSmall} />}
          className="size-7"
        >
          <span className="relative flex size-7 items-center justify-center text-text-primary">
            <BellIcon size={IconSize.Size16} />
            <span className="absolute right-0.5 top-0.5 size-2 rounded-max bg-accent-ketchup-default" />
          </span>
        </Ghost>
        <Ghost
          id="profile"
          {...ghost}
          done={sim.isDone('profile')}
          label="You"
          className="h-7 w-16"
        >
          <span className="flex items-center gap-1.5">
            <img
              src={mockUser.image}
              alt=""
              className="size-7 rounded-8 object-cover"
            />
            <span className="font-bold text-text-primary typo-caption2">
              {mockUser.name}
            </span>
          </span>
        </Ghost>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        <Ghost
          id="brief"
          {...ghost}
          done={sim.isDone('brief')}
          label="Your daily brief lands here"
          className="h-14 w-full"
        >
          <div className="flex h-14 items-center gap-3 rounded-10 bg-accent-cabbage-flat px-3">
            <BriefIcon className="text-accent-cabbage-default" secondary />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-text-primary typo-caption1">
                {mockUser.name}&apos;s briefing · Must know
              </p>
              <p className="truncate text-text-tertiary typo-caption2">
                Bun 1.3 ships workspaces. TypeScript 6 beta. Three more.
              </p>
            </div>
          </div>
        </Ghost>
        <div className="grid flex-1 grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="flex flex-col gap-1.5 rounded-10 border border-border-subtlest-tertiary p-2"
            >
              <span className="h-1.5 w-4/5 rounded-max bg-surface-float" />
              <span className="h-1.5 w-1/2 rounded-max bg-surface-float" />
              <span className="mt-auto h-8 rounded-6 bg-surface-float" />
            </span>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-border-subtlest-tertiary p-2">
        {sim.state.token ? (
          <div className="iq-rise flex flex-col gap-0.5 rounded-8 bg-background-subtle px-3 py-2 font-mono typo-caption2">
            <span className="text-text-tertiary">
              $ curl -H &quot;Bearer {maskedToken}&quot; …/profile
            </span>
            {sim.isDone('apiCall') ? (
              <span className="iq-rise text-accent-avocado-default">
                {`{ "name": "${mockUser.name}", "reputation": 10 }`}
              </span>
            ) : (
              <Ghost
                id="apiCall"
                {...ghost}
                done={false}
                label="Waiting for your first call"
                className="h-5 w-full"
              >
                {null}
              </Ghost>
            )}
          </div>
        ) : (
          <Ghost
            id="apiKey"
            {...ghost}
            done={false}
            label="Your terminal, optional"
            className="h-9 w-full"
          >
            {null}
          </Ghost>
        )}
      </div>

      {sim.isDone('notifications') && (
        <div className="iq-rise iq-elevated absolute bottom-16 right-3 flex w-52 items-start gap-2 rounded-12 bg-background-popover p-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-8 bg-text-primary">
            <LogoIcon
              className={{
                container: 'size-4 [&_g]:[fill:var(--theme-surface-invert)]',
              }}
            />
          </span>
          <p className="text-text-secondary typo-caption2">
            <span className="font-bold text-text-primary">Nimrod</span> replied
            to your comment
          </p>
        </div>
      )}
    </div>
  );
};

export const Assembled = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const [focusId, setFocusId] = useState<QuestId | null>(null);
  const activeId = focusId ?? sim.nextQuest?.id ?? null;
  const active = introQuests.find(({ id }) => id === activeId) ?? null;
  const isMobile = device === 'mobile';
  const allClaimed = introQuests.every(
    ({ id }) => sim.phaseOf(id) === 'claimed',
  );

  if (allClaimed) {
    return (
      <PopupShell device={device} width="30rem">
        <div className="p-6">
          <CompletionHero />
        </div>
      </PopupShell>
    );
  }

  return (
    <PopupShell device={device} width="56rem">
      <header className="flex flex-col gap-1 p-6 pb-4 pr-14">
        <h2 className="iq-balance font-bold text-text-primary typo-title3">
          Your daily.dev has {introQuests.length - sim.doneCount} empty spots
        </h2>
        <p className="text-text-tertiary typo-footnote">
          Click a dashed outline to fill it in.
        </p>
      </header>
      <div
        className={classNames(
          'flex gap-5 px-6 pb-6',
          isMobile ? 'flex-col' : 'items-stretch',
        )}
      >
        <div className={isMobile ? 'h-[22rem]' : 'h-[26rem] flex-1'}>
          <MiniApp focusId={activeId} onFocus={setFocusId} />
        </div>
        <aside
          className={classNames(
            'flex flex-col gap-4',
            isMobile ? 'w-full' : 'w-[17rem] shrink-0',
          )}
        >
          <ProgressMeter showRewards={false} />
          {active && (
            <div
              key={active.id}
              className="iq-rise flex flex-col gap-3 rounded-16 bg-surface-float p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-text-primary typo-callout">
                  {active.name}
                </p>
                {sim.isDone(active.id) && (
                  <VIcon
                    className="shrink-0 text-accent-avocado-default"
                    secondary
                  />
                )}
              </div>
              <p className="iq-pretty text-text-secondary typo-footnote">
                {active.pitch}
              </p>
              <div className="empty:hidden">
                <QuestDetail quest={active} compact />
              </div>
              <QuestCta quest={active} size={ButtonSize.Medium} block />
              <RewardTag xp={active.xp} cores={active.cores} />
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {introQuests.map((quest) => (
              <button
                key={quest.id}
                type="button"
                onClick={() => setFocusId(quest.id)}
                className={classNames(
                  'flex items-center gap-1 rounded-max border px-2 py-1 typo-caption2',
                  quest.id === activeId
                    ? 'border-text-primary text-text-primary'
                    : 'border-border-subtlest-tertiary text-text-tertiary hover:text-text-primary',
                  sim.isDone(quest.id) && 'text-accent-avocado-default',
                )}
              >
                {sim.isDone(quest.id) && (
                  <VIcon size={IconSize.XXSmall} secondary />
                )}
                {quest.id === 'apiCall'
                  ? 'API call'
                  : quest.cta.replace(' for free', '')}
              </button>
            ))}
          </div>
          <div className="mt-auto flex flex-col items-center gap-2">
            <ClaimAllBar />
            <HideForever />
          </div>
        </aside>
      </div>
    </PopupShell>
  );
};
