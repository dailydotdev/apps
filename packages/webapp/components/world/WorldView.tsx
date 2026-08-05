import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { WorldBoot } from './WorldBoot';
import { WorldCustomizeSheet } from './WorldCustomize';
import { WorldHeader } from './WorldHeader';
import { useIsOwnWorld, WorldInvite } from './WorldInvite';
import { WorldImmersiveToggle, WorldMark } from './WorldMark';
import { WorldPanel } from './WorldPanel';
import { WorldPrivate } from './WorldPrivate';
import { WorldRiding } from './WorldRiding';
import { WorldStatus } from './WorldStatus';
import { WorldTimeline } from './WorldTimeline';
import type { WorldEngine, WorldState } from './worldState';
import type { UserWorldResult } from './useUserWorld';
import { useWorldDraft } from './useWorldDraft';
import { useWorldPlate } from './useWorldPlate';
import { buildWorld } from './engine/buildWorld';
import { createWorldEngine } from './engine/world';
import { buildUnbuiltWorld } from './unbuiltWorld';
import {
  isWorldCustomised,
  resolveCrest,
  resolveLook,
  resolveSky,
} from './worldCustomization';

const INITIAL: WorldState = {
  status: 'loading',
  progress: 0,
  message: '',
  playing: false,
  speed: 1,
  day: 0,
  totalDays: 1,
  rank: [],
};

/* Where the overlay is standing, so the camera frames the world into the part
   of the screen that is actually visible rather than into the window. Below
   laptop the rail is gone and only the timeline is in the way; with the panels
   hidden nothing is, apart from the headroom the realm names always need. */
const PAD_DESKTOP = { l: 344, r: 18, t: 96, b: 112 };
const PAD_MOBILE = { l: 16, r: 16, t: 136, b: 128 };
const PAD_IMMERSIVE = { l: 16, r: 16, t: 96, b: 16 };
/* Same rail, no scrubber under an unbuilt world (nothing to replay), and a
   deep band kept clear at the top for the one thing that asks anything of the
   reader, which stands on the world rather than in the rail. */
const PAD_UNBUILT_DESKTOP = { l: 344, r: 18, t: 176, b: 40 };
const PAD_UNBUILT_MOBILE = { l: 16, r: 16, t: 272, b: 32 };

interface WorldViewProps {
  user: PublicProfile;
  /* Fetched by the page, not here: this component only exists once its own
     chunk has landed, and a query started at that point is a query that could
     have been running for the whole of the download. */
  world: UserWorldResult;
}

/**
 * The page's whole client half: one WebGL world, one overlay reading its state.
 *
 * The engine is created once on mount and torn down on unmount: it holds a
 * WebGL context, and browsers cap those low enough that leaking one is a page
 * that silently stops rendering the third time you visit it.
 */
export function WorldView({ user, world }: WorldViewProps): ReactElement {
  const mountRef = useRef<HTMLDivElement>(null);

  const engineRef = useRef<WorldEngine | null>(null);
  const [state, setState] = useState<WorldState>(INITIAL);
  const [failed, setFailed] = useState<string | null>(null);
  const [isImmersive, setIsImmersive] = useState(false);
  const isLaptop = useViewSize(ViewSize.Laptop);

  const {
    districts,
    timeline,
    settings,
    isPending,
    isHistoryPending,
    isEmpty,
    isPrivate,
    error,
  } = world;
  const isOwn = useIsOwnWorld(user);
  const draft = useWorldDraft(user.id, settings);
  const { applied } = draft;

  /* The app keeps a permanent scrollbar gutter on the body so feeds don't jump
     when they grow. Nothing on this page scrolls, and a fixed layer is laid out
     inside that gutter, so the gutter reads as a dead strip down the right of
     the world. The shared `hidden-scrollbar` class is no help: it pads the body
     and the fixed layers back out by the same width on purpose. */
  useEffect(() => {
    const { style } = document.body;
    const previous = style.overflowY;
    style.overflowY = 'hidden';

    return () => {
      style.overflowY = previous;
    };
  }, []);

  useEffect(() => {
    const engine = createWorldEngine({
      container: mountRef.current,
      onState: setState,
    }) as WorldEngine;
    engineRef.current = engine;

    return () => {
      engineRef.current = null;
      engine.dispose();
    };
  }, []);

  // Districts alone put a finished world on screen: the layout packs islands by
  // lifetime totals, and those are on the small query. So nothing waits for the
  // growth log.
  //
  // Once per reader, and no more. These queries refetch on window focus, and a
  // reload tears the world down and builds it again: camera reframed, the day
  // back at the end, the realm you had walked into closed. Coming back to the
  // tab is not a reason to take somebody's place away from them.
  //
  // State rather than a ref, because the render BEFORE this effect runs has to
  // know: a soft navigation from one world to another keeps this component and
  // its engine state, and for that one render the queries have settled on the
  // new reader while everything the overlay reads still describes the old one.
  const [raisedFor, setRaisedFor] = useState<string | null>(null);
  const [hasNoReplay, setHasNoReplay] = useState(false);
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || raisedFor === user.id) {
      return;
    }
    /* Nothing read is still a place: a reader with no districts gets their six
       realms as bare ground rather than a sentence on a black screen. It is
       raised through the same path a real world is, so everything below here
       (the camera, the chrome, the failure case) is unaware of the difference. */
    const hasDistricts = !!districts?.length;
    if (!hasDistricts && !isEmpty) {
      return;
    }
    setRaisedFor(user.id);
    setHasNoReplay(false);

    /* Building the model throws; raising the world rejects. Both have to land
       in `failed`, or the boot bar sweeps forever over a world that died. */
    try {
      engine
        .load(
          hasDistricts
            ? buildWorld(user.id, districts, [])
            : buildUnbuiltWorld(user.id),
        )
        .catch((bootError: Error) => setFailed(bootError.message));
    } catch (buildError) {
      setFailed((buildError as Error).message);
    }
  }, [districts, isEmpty, raisedFor, user?.id]);

  // And the log, once it lands, folded in under a world that is already up. The
  // day it is folded in on carries the same lifetime totals the world was
  // raised on, so there is nothing to rebuild and nothing to watch happen.
  //
  // `hasNoReplay` is only ever set when the log turns out to hold no replay,
  // never on the way to one. The timeline bar reads it, and the two facts that
  // keep it on screen (a log still on the wire, and a world that says it is
  // replayable) are separated by the render this effect runs after. Flipping a
  // single "is it pending" flag would take the bar down for that one frame and
  // put it straight back.
  const historyForRef = useRef<string | null>(null);
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || failed || raisedFor !== user.id) {
      return;
    }
    // Bare ground has no history and no query on the wire for one. Said here
    // rather than skipped, because this is what takes the scrubber down.
    if (isEmpty) {
      setHasNoReplay(true);
      return;
    }
    if (isHistoryPending || historyForRef.current === user.id) {
      return;
    }
    historyForRef.current = user.id;

    const model = timeline?.length
      ? buildWorld(user.id, districts, timeline)
      : null;
    if (model?.replayable && engine.attachHistory(model)) {
      return;
    }
    setHasNoReplay(true);
  }, [
    districts,
    timeline,
    isHistoryPending,
    isEmpty,
    failed,
    raisedFor,
    user?.id,
  ]);

  /* Look and crest are the world's, not the viewer's, so every visitor sees them
     as dressed. While the bench is open these read the draft instead, so chips
     land live on the frame behind the panel. */
  useEffect(() => {
    engineRef.current?.setLook(resolveLook(applied));
  }, [applied]);

  useEffect(() => {
    engineRef.current?.setCrest(resolveCrest(applied, user.id, districts));
  }, [applied, districts, user.id]);

  useEffect(() => {
    engineRef.current?.setSky(resolveSky(applied));
  }, [applied]);

  /* The share card is composed server-side around a render only this machine
     can cheaply make. Reads the STORED settings, not the draft: a plate is what
     the world looks like to everyone, not what the owner is trying on. */
  useWorldPlate({
    userId: user.id,
    isOwn,
    isPrivate,
    isReady: state.status === 'ready' && raisedFor === user.id,
    engineRef,
    districts,
    settings,
  });

  useEffect(() => {
    if (isImmersive) {
      engineRef.current?.setPadding(PAD_IMMERSIVE);
      return;
    }

    if (isEmpty) {
      engineRef.current?.setPadding(
        isLaptop ? PAD_UNBUILT_DESKTOP : PAD_UNBUILT_MOBILE,
      );
      return;
    }

    engineRef.current?.setPadding(isLaptop ? PAD_DESKTOP : PAD_MOBILE);
  }, [isLaptop, isImmersive, isEmpty]);

  const onSeek = useCallback((day: number) => engineRef.current?.seek(day), []);
  const onToggle = useCallback(() => engineRef.current?.toggle(), []);
  const onStart = useCallback(() => engineRef.current?.toStart(), []);
  const onEnd = useCallback(() => engineRef.current?.toEnd(), []);
  const onSpeed = useCallback(
    (speed: number) => engineRef.current?.setSpeed(speed),
    [],
  );
  const onFocus = useCallback(
    (key: string) => engineRef.current?.focus(key),
    [],
  );
  const onLeaveRealm = useCallback(() => engineRef.current?.leaveRealm(), []);
  const attachSpark = useCallback(
    (canvas: HTMLCanvasElement | null) =>
      engineRef.current?.attachSpark(canvas),
    [],
  );

  /* Kept as the reason rather than as a boolean so it still reads in a stack
     trace and in the devtools, and never as copy: what a reader is told is
     `WorldStatus`'s own line. */
  const failure = failed ?? error?.message;
  // `raisedFor` is the third term for the same reason it is state: until the
  // engine has been handed THIS reader, `state` is somebody else's world.
  const isBooting =
    state.status === 'loading' || isPending || raisedFor !== user.id;
  // Riding hides everything that reads the world from outside it: a panel
  // anchored to a plot means nothing from the shoulder of a bird.
  const isRiding = !!state.riding;
  const isStanding = !isBooting && !failure;
  /* Bare ground is a world, and it keeps the whole shell: same rail, same
     header, same identity block. What the shell says changes (every counter is
     a zero and the realms are listed as ground to raise), and the scrubber is
     gone, because a world with no reading in it has no history to walk. */
  const isUnbuilt = isStanding && isEmpty;
  const isChromeVisible = isStanding && !isRiding && !isImmersive;
  const onToggleImmersive = useCallback(
    () => setIsImmersive((previous) => !previous),
    [],
  );

  /* The bench is the owner's only; everything else here is the same for every visitor. */
  const ownerDraft = isOwn ? draft : undefined;
  const worldName = applied?.name ?? undefined;
  /* Never on an unbuilt world: WorldInvite already makes the one ask there,
     and it makes it nowhere else. */
  const showNudge = isOwn && !isUnbuilt && !isWorldCustomised(applied);

  /* A hidden world draws nothing — no map, timeline or crest — so this returns
     before the boot screen too. */
  if (isPrivate) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-background-default">
        {/* Kept mounted and empty: the engine holds a WebGL context on this node,
            and unmounting would leak it rather than release it. `load` is never
            reached here since there are no districts. */}
        <div ref={mountRef} className="absolute inset-0" />
        <WorldPrivate user={user} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-background-default">
      <div ref={mountRef} className="absolute inset-0" />

      {isChromeVisible && (
        <>
          {isLaptop ? (
            <WorldPanel
              user={user}
              state={state}
              unbuilt={isUnbuilt}
              isImmersive={isImmersive}
              worldName={worldName}
              draft={ownerDraft}
              districts={districts}
              showNudge={showNudge}
              onToggleImmersive={onToggleImmersive}
              onFocus={onFocus}
              onLeaveRealm={onLeaveRealm}
            />
          ) : (
            <>
              <WorldHeader
                user={user}
                state={state}
                unbuilt={isUnbuilt}
                isImmersive={isImmersive}
                worldName={worldName}
                showNudge={showNudge && !draft.isOpen}
                onToggleImmersive={onToggleImmersive}
                onLeaveRealm={onLeaveRealm}
                onCustomize={ownerDraft?.open}
              />
              {/* No rail here for the bench, so it takes the whole screen; the
                  world stays live underneath. */}
              {!!ownerDraft?.isOpen && !!ownerDraft.settings && (
                <WorldCustomizeSheet
                  userId={user.id}
                  draft={ownerDraft}
                  districts={districts}
                  settings={ownerDraft.settings}
                />
              )}
            </>
          )}
          {/* On screen while the growth log is still on the wire, inert, in the
              place it will be live in. It is the last thing to arrive and the
              only one that changes the layout, so it reserves its own room. */}
          {!isUnbuilt && (state.replayable || !hasNoReplay) && (
            <WorldTimeline
              state={state}
              pending={!state.replayable}
              sparkRef={attachSpark}
              onToggle={onToggle}
              onSeek={onSeek}
              onStart={onStart}
              onEnd={onEnd}
              onSpeed={onSpeed}
            />
          )}
        </>
      )}

      {isRiding && <WorldRiding state={state} />}

      {isUnbuilt && !isRiding && <WorldInvite user={user} />}

      {/* The mark rides in the mobile bar, which is where the space already is.
          Everywhere else (laptop, riding, panels hidden) that bar is gone, so
          it stands on the world instead. */}
      {isStanding && (isLaptop || !isChromeVisible) && <WorldMark floating />}

      {/* The toggle lives in whatever chrome is on screen. Once none is, it
          stands on the world too, opposite the mark, because it is then the
          only way back to the panels. */}
      {isStanding && !isChromeVisible && !isRiding && (
        <WorldImmersiveToggle
          floating
          isImmersive={isImmersive}
          onToggleImmersive={onToggleImmersive}
        />
      )}

      {!isStanding &&
        (failure ? (
          <WorldStatus user={user} />
        ) : (
          /* Determinate only once the engine is raising something. Before that
             the wait is a chunk download and a query, neither of which can be
             measured, so the same bar sweeps instead of lying about a number. */
          <WorldBoot
            user={user}
            progress={state.progress > 0 ? state.progress : undefined}
            message={state.progress > 0 ? state.message : undefined}
          />
        ))}
    </div>
  );
}
