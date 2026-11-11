import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { QuestId } from '../data';
import { journeyQuests, mockUser, sumRewards } from '../data';
import { ClaimAllBar, CompletionHero, HideForever } from '../kit';
import { useSim } from '../sim';
import type { Frame } from './kit';
import { FinalCta, Meta, QuestStage, SetupHeader, Surface } from './kit';
import type { Marker } from './trail';
import { JoinedStep, SummitStep, TrailStep } from './trail';

// Finalist 3 · Journey trail, ordered by what brings new users back (Dave's
// Onboarding Return Drivers and Feature Adoption Paths, Oct 2026): the
// extension first, then a first read, notifications right after it, a daily
// reminder, and a story to come back to. The brief stays as an optional bonus.
// Completing the profile is dropped here: it goes with lower return.

const rewards = sumRewards(journeyQuests);

export const JourneyFinal = ({
  device = 'desktop',
  frame = 'modal',
  onClose,
}: {
  device?: 'desktop' | 'mobile';
  frame?: Frame;
  onClose?: () => void;
}): ReactElement => {
  const sim = useSim();
  const [openId, setOpenId] = useState<QuestId | 'none' | null>(null);
  const hereId =
    journeyQuests.find(({ id }) => sim.phaseOf(id) !== 'claimed')?.id ?? null;
  const expandedId = openId === 'none' ? null : openId ?? hereId;

  useEffect(() => {
    setOpenId(null);
  }, [hereId]);
  const allClaimed = !hereId;
  const left = journeyQuests.filter(({ id }) => !sim.isDone(id)).length;

  return (
    <Surface frame={frame} device={device} onClose={onClose}>
      {allClaimed ? (
        <div className="p-6">
          <CompletionHero onClose={onClose} />
        </div>
      ) : (
        <>
          <SetupHeader
            showMeter={false}
            eyebrow={`Earn ${rewards.xp} XP and ${rewards.cores} Cores`}
            title={`${mockUser.name}, ${left} ${
              left === 1 ? 'step' : 'steps'
            } to a daily.dev that fits you`}
          />
          <ol className="flex flex-col px-5">
            <JoinedStep />
            {journeyQuests.map((quest, index) => {
              let marker: Marker = 'ahead';

              if (sim.phaseOf(quest.id) === 'claimed') {
                marker = 'done';
              } else if (quest.id === hereId) {
                marker = 'here';
              }

              return (
                <TrailStep
                  key={quest.id}
                  quest={quest}
                  number={index + 1}
                  marker={marker}
                  isOpen={expandedId === quest.id}
                  onToggle={() =>
                    setOpenId(expandedId === quest.id ? 'none' : quest.id)
                  }
                >
                  <p className="iq-pretty text-text-secondary typo-footnote">
                    {quest.pitch}
                  </p>
                  <div className="empty:hidden">
                    <QuestStage quest={quest} />
                  </div>
                  <FinalCta quest={quest} isPrimary />
                  <Meta quest={quest} />
                </TrailStep>
              );
            })}
            <SummitStep rewards={rewards} />
          </ol>
          <footer className="mt-auto flex flex-col items-center gap-3 p-5 pt-4">
            <ClaimAllBar />
            <HideForever />
          </footer>
        </>
      )}
    </Surface>
  );
};
