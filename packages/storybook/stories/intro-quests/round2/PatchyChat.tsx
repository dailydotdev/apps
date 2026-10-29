import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { cloudinaryPatchyWaiting } from '@dailydotdev/shared/src/lib/image';
import type { IntroQuest, QuestId } from '../data';
import { introQuests, mockUser, totalRewards } from '../data';
import {
  CompletionHero,
  HideForever,
  PopupShell,
  QuestCta,
  QuestDetail,
} from '../kit';
import { useSim } from '../sim';

// 5 · Patchy walks you through it. Slackbot's lesson: you learn a product by
// doing a real thing in the conversation, not by reading about it. Patchy
// asks for one thing at a time, the button lives inside his message, your
// answer appears as your reply, and "Later" is always one tap away.

const asks: Record<QuestId, string> = {
  extension: `Hey ${mockUser.name}! Want your feed on every new tab? It is one click and it is free.`,
  notifications:
    'Want a ping when someone replies to you? Only replies, mentions and your streak. Promise.',
  brief:
    'I can read today’s posts and give you the short version. Your first brief is on me.',
  profile:
    'Developers here like to know who they are talking to. A few details and your profile is done.',
  apiKey:
    'Optional, but fun: grab an API key and your feed works in scripts and agents too.',
  apiCall: 'Paste this in your terminal and say hi. I will be listening.',
  read3: 'Three good reads and your feed starts to know you.',
  reminder: 'Want one nudge a day at a time you pick?',
  story: 'Follow a developing story and I will tell you when it moves.',
};

const cheers: Record<QuestId, string> = {
  extension: 'Installed! Open a new tab whenever you like.',
  notifications: 'Notifications on.',
  brief: 'Brief ready.',
  profile: 'Profile done.',
  apiKey: 'Key created.',
  apiCall: 'Call made.',
  read3: 'Read three.',
  reminder: 'Reminder set.',
  story: 'Following.',
};

const Avatar = (): ReactElement => (
  <img
    src={cloudinaryPatchyWaiting}
    alt=""
    className="size-8 shrink-0 rounded-max bg-surface-float object-contain"
  />
);

const PatchyBubble = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="iq-rise flex items-end gap-2">
    <Avatar />
    <div className="flex max-w-[85%] flex-col gap-3 rounded-16 rounded-bl-4 bg-surface-float p-3 text-text-primary typo-callout">
      {children}
    </div>
  </div>
);

const UserBubble = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="iq-rise flex justify-end">
    <div className="max-w-[80%] rounded-16 rounded-br-4 bg-brand-default px-3 py-2 font-bold text-white typo-callout">
      {children}
    </div>
  </div>
);

const Typing = (): ReactElement => (
  <div className="flex items-end gap-2">
    <Avatar />
    <div className="flex gap-1 rounded-16 rounded-bl-4 bg-surface-float px-3 py-3">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="iq-pulse size-1.5 rounded-max bg-text-tertiary"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  </div>
);

const Ask = ({
  quest,
  onLater,
}: {
  quest: IntroQuest;
  onLater: () => void;
}): ReactElement => (
  <PatchyBubble>
    <p className="iq-pretty">{asks[quest.id]}</p>
    <div className="empty:hidden">
      <QuestDetail quest={quest} compact />
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <QuestCta quest={quest} />
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        onClick={onLater}
      >
        Later
      </Button>
    </div>
  </PatchyBubble>
);

export const PatchyChat = ({
  device = 'desktop',
}: {
  device?: 'desktop' | 'mobile';
}): ReactElement => {
  const sim = useSim();
  const [later, setLater] = useState<QuestId[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const handled = introQuests.filter(
    ({ id }) => sim.phaseOf(id) === 'claimed' || later.includes(id),
  );
  const current = introQuests.find(
    (quest) =>
      sim.phaseOf(quest.id) !== 'claimed' &&
      !later.includes(quest.id) &&
      !sim.isBlockedBy(quest),
  );
  const allClaimed = introQuests.every(
    ({ id }) => sim.phaseOf(id) === 'claimed',
  );

  useEffect(() => {
    setTyping(true);
    const timer = window.setTimeout(() => setTyping(false), 600);

    return () => window.clearTimeout(timer);
  }, [current?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  });

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
    <PopupShell device={device} width="30rem" className="tablet:h-[40rem]">
      <header className="flex items-center gap-3 border-b border-border-subtlest-tertiary p-4 pr-14">
        <img
          src={cloudinaryPatchyWaiting}
          alt=""
          className="size-10 rounded-max bg-surface-float object-contain"
        />
        <div>
          <p className="font-bold text-text-primary typo-callout">Patchy</p>
          <p className="iq-tabular text-text-tertiary typo-caption1">
            Setting you up · {sim.earned.xp}/{totalRewards.xp} XP
          </p>
        </div>
      </header>
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        {handled.map((quest) => (
          <React.Fragment key={quest.id}>
            <PatchyBubble>
              <p className="iq-pretty text-text-secondary">{asks[quest.id]}</p>
            </PatchyBubble>
            <UserBubble>
              {later.includes(quest.id) && sim.phaseOf(quest.id) !== 'claimed'
                ? 'Later'
                : cheers[quest.id]}
            </UserBubble>
            {sim.phaseOf(quest.id) === 'claimed' && (
              <PatchyBubble>
                <p>
                  +{quest.xp} XP. Nice <span aria-hidden>🐾</span>
                </p>
              </PatchyBubble>
            )}
          </React.Fragment>
        ))}
        {current && typing && <Typing />}
        {current && !typing && (
          <Ask
            key={current.id}
            quest={current}
            onLater={() => setLater((value) => [...value, current.id])}
          />
        )}
        {!current && (
          <PatchyBubble>
            <p>
              That is everything for now. Snoozed steps wait for you in the
              header whenever you want them.
            </p>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              className="w-fit"
              onClick={() => setLater([])}
            >
              Go through the skipped ones
            </Button>
          </PatchyBubble>
        )}
      </div>
      <footer
        className={classNames(
          'flex justify-center border-t border-border-subtlest-tertiary p-3',
        )}
      >
        <HideForever />
      </footer>
    </PopupShell>
  );
};
