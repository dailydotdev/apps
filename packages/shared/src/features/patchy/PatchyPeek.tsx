import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { MoonIcon, SparkleIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { patchyPoseImage } from './patchyAssets';
import type { PatchyEmote, PatchyTrigger } from './patchyTriggers';
import { patchyPeeks } from './patchyTriggers';

// Box the peek lives in, starting at the rail's right edge. It clips, so
// Patchy appears to slide out from behind the rail without any z-order tricks.
const BOX_WIDTH = 144;
const BOX_HEIGHT = 136;
const POSE_WIDTH = 112;
// Under the sidebar (70) and the header, above the feed; modals cover it.
const PEEK_Z_INDEX = 69;

type Phase = 'hidden' | 'in' | 'sliver' | 'out';

interface Step {
  phase: Phase;
  ms: number;
}

const SLIDE_MS = 380;

// Every peek is enter → hold → back, ~2.5s in view. The Friday deploy one
// darts back early and comes back as a sliver with a sweat drop.
const stepsFor = (trigger: PatchyTrigger): Step[] =>
  trigger === 'friday_deploy'
    ? [
        { phase: 'in', ms: 900 },
        { phase: 'out', ms: 450 },
        { phase: 'sliver', ms: 1500 },
        { phase: 'out', ms: SLIDE_MS },
      ]
    : [
        { phase: 'in', ms: 2500 },
        { phase: 'out', ms: SLIDE_MS },
      ];

const poseTransform: Record<Phase, string> = {
  hidden: 'translateX(-105%) rotate(0deg)',
  in: 'translateX(-22%) rotate(12deg)',
  sliver: 'translateX(-68%) rotate(6deg)',
  out: 'translateX(-105%) rotate(0deg)',
};

const Emote = ({ emote }: { emote: PatchyEmote }): ReactElement => {
  const className =
    'absolute right-0 top-0 motion-safe:animate-patchy-emote [animation-delay:300ms]';
  switch (emote) {
    case 'hearts':
      return (
        <span className={classNames(className, 'flex gap-0.5 typo-title3')}>
          <span>💗</span>
          <span className="-translate-y-2 typo-callout">💗</span>
        </span>
      );
    case 'dots':
      return (
        <span
          className={classNames(
            className,
            'rounded-12 bg-surface-invert px-2 font-bold text-surface-primary typo-callout',
          )}
        >
          …
        </span>
      );
    case 'sparkle':
      return (
        <SparkleIcon
          secondary
          size={IconSize.Medium}
          className={classNames(className, 'text-accent-cheese-default')}
        />
      );
    case 'moon':
      return (
        <MoonIcon
          secondary
          size={IconSize.Medium}
          className={classNames(className, 'text-accent-blueCheese-default')}
        />
      );
    default:
      return <span className={classNames(className, 'typo-title3')}>💧</span>;
  }
};

interface PatchyPeekProps {
  trigger: PatchyTrigger;
  // The Streak tab button he peeks out next to.
  anchorId: string;
  onDone: () => void;
}

export const PatchyPeek = ({
  trigger,
  anchorId,
  onDone,
}: PatchyPeekProps): ReactElement | null => {
  const [box, setBox] = useState<CSSProperties | null>(null);
  const [phase, setPhase] = useState<Phase>('hidden');
  const [stepIndex, setStepIndex] = useState(-1);
  const steps = stepsFor(trigger);
  const { pose, emote } = patchyPeeks[trigger];

  useLayoutEffect(() => {
    const anchor = document.getElementById(anchorId);
    const rail = anchor?.closest('nav');
    if (!anchor || !rail) {
      // Folded into "More" on a short rail: nothing to peek from.
      onDone();
      return;
    }
    const tab = anchor.getBoundingClientRect();
    setBox({
      left: rail.getBoundingClientRect().right,
      top: tab.top + tab.height / 2 - BOX_HEIGHT / 2,
      width: BOX_WIDTH,
      height: BOX_HEIGHT,
      zIndex: PEEK_Z_INDEX,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorId]);

  useEffect(() => {
    if (!box) {
      return undefined;
    }
    // One frame in the hidden spot first, so the slide-in transitions.
    const frame = requestAnimationFrame(() => setStepIndex(0));
    return () => cancelAnimationFrame(frame);
  }, [box]);

  useEffect(() => {
    if (stepIndex < 0) {
      return undefined;
    }
    if (stepIndex >= steps.length) {
      onDone();
      return undefined;
    }
    setPhase(steps[stepIndex].phase);
    const timeout = setTimeout(
      () => setStepIndex((index) => index + 1),
      steps[stepIndex].ms,
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  if (!box) {
    return null;
  }

  const showEmote =
    (phase === 'in' && emote !== 'sweat') ||
    (phase === 'sliver' && emote === 'sweat');
  const isDart = trigger === 'friday_deploy' && stepIndex === 1;

  return createPortal(
    <div
      aria-hidden
      data-testid="patchy-peek"
      className="pointer-events-none fixed overflow-hidden"
      style={box}
    >
      <div
        className="absolute bottom-0 left-0"
        style={{
          width: POSE_WIDTH,
          transform: poseTransform[phase],
          transformOrigin: 'left bottom',
          transition: `transform ${isDart ? 180 : SLIDE_MS}ms cubic-bezier(0.34, 1.4, 0.64, 1)`,
        }}
      >
        <img
          src={patchyPoseImage[pose]}
          alt=""
          className="w-full"
          draggable={false}
        />
        {showEmote && <Emote emote={emote} />}
      </div>
    </div>,
    document.body,
  );
};
