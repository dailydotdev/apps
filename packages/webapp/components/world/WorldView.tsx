import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { WorldBoot } from './WorldBoot';
import { WorldHeader } from './WorldHeader';
import { WorldImmersiveToggle, WorldMark } from './WorldMark';
import { WorldPanel } from './WorldPanel';
import { WorldRiding } from './WorldRiding';
import { WorldStatus } from './WorldStatus';
import { WorldTimeline } from './WorldTimeline';
import type { WorldEngine, WorldState } from './worldState';
import type { UserWorldResult } from './useUserWorld';
import { buildWorld } from './engine/buildWorld';
import { createWorldEngine } from './engine/world';

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
 * The engine is created once on mount and torn down on unmount — it holds a
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

  const { districts, timeline, isPending, isHistoryPending, isEmpty, error } =
    world;

  /* The app keeps a permanent scrollbar gutter on the body so feeds don't jump
     when they grow. Nothing on this page scrolls, and a fixed layer is laid out
     inside that gutter — so the gutter reads as a dead strip down the right of
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

  // Districts alone put a finished world on screen — the layout packs islands by
  // lifetime totals, and those are on the small query. So nothing waits for the
  // growth log.
  //
  // Once per reader, and no more. These queries refetch on window focus, and a
  // reload tears the world down and builds it again — camera reframed, the day
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
    if (!engine || !districts?.length || raisedFor === user.id) {
      return;
    }
    setRaisedFor(user.id);
    setHasNoReplay(false);

    try {
      engine.load(buildWorld(user.id, districts, []));
    } catch (buildError) {
      setFailed((buildError as Error).message);
    }
  }, [districts, raisedFor, user?.id]);

  // And the log, once it lands, folded in under a world that is already up. The
  // day it is folded in on carries the same lifetime totals the world was
  // raised on, so there is nothing to rebuild and nothing to watch happen.
  //
  // `hasNoReplay` is only ever set when the log turns out to hold no replay —
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
  }, [districts, timeline, isHistoryPending, failed, raisedFor, user?.id]);

  useEffect(() => {
    if (isImmersive) {
      engineRef.current?.setPadding(PAD_IMMERSIVE);
      return;
    }

    engineRef.current?.setPadding(isLaptop ? PAD_DESKTOP : PAD_MOBILE);
  }, [isLaptop, isImmersive]);

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

  const message = failed ?? error?.message;
  // `raisedFor` is the third term for the same reason it is state: until the
  // engine has been handed THIS reader, `state` is somebody else's world.
  const isBooting =
    state.status === 'loading' || isPending || raisedFor !== user.id;
  // Riding hides everything that reads the world from outside it — a panel
  // anchored to a plot means nothing from the shoulder of a bird.
  const isRiding = !!state.riding;
  const isStanding = !isBooting && !isEmpty && !message;
  const isChromeVisible = isStanding && !isRiding && !isImmersive;
  const onToggleImmersive = useCallback(
    () => setIsImmersive((previous) => !previous),
    [],
  );

  return (
    <div className="fixed inset-0 overflow-hidden bg-background-default">
      <div ref={mountRef} className="absolute inset-0" />

      {isChromeVisible && (
        <>
          {isLaptop ? (
            <WorldPanel
              user={user}
              state={state}
              isImmersive={isImmersive}
              onToggleImmersive={onToggleImmersive}
              onFocus={onFocus}
              onLeaveRealm={onLeaveRealm}
            />
          ) : (
            <WorldHeader
              user={user}
              state={state}
              isImmersive={isImmersive}
              onToggleImmersive={onToggleImmersive}
              onLeaveRealm={onLeaveRealm}
            />
          )}
          {/* On screen while the growth log is still on the wire, inert, in the
              place it will be live in. It is the last thing to arrive and the
              only one that changes the layout, so it reserves its own room. */}
          {(state.replayable || !hasNoReplay) && (
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

      {/* The mark rides in the mobile bar, which is where the space already is.
          Everywhere else — laptop, riding, panels hidden — that bar is gone, so
          it stands on the world instead. */}
      {isStanding && (isLaptop || !isChromeVisible) && <WorldMark floating />}

      {/* The toggle lives in whatever chrome is on screen. Once none is, it
          stands on the world too — opposite the mark, because it is then the
          only way back to the panels. */}
      {isStanding && !isChromeVisible && !isRiding && (
        <WorldImmersiveToggle
          floating
          isImmersive={isImmersive}
          onToggleImmersive={onToggleImmersive}
        />
      )}

      {!isStanding &&
        (isEmpty || message ? (
          <WorldStatus user={user} message={message} />
        ) : (
          /* Determinate only once the engine is raising something. Before that
             the wait is a chunk download and a query, neither of which can be
             measured — so the same bar sweeps instead of lying about a number. */
          <WorldBoot
            user={user}
            progress={state.progress > 0 ? state.progress : undefined}
            message={state.progress > 0 ? state.message : undefined}
          />
        ))}
    </div>
  );
}
