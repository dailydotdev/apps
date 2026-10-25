import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { cloudinaryPatchyBone } from '@dailydotdev/shared/src/lib/image';

// Explorations for "it's unclear you drag the bone to Patchy". Each hint is
// drawn over the production screen, positioned from its own DOM, so the
// shipped component stays untouched until one direction is picked.

export type DragHint =
  | 'current'
  | 'hand'
  | 'touch'
  | 'paw'
  | 'hand3d'
  | 'path'
  | 'bubble'
  | 'chip';

export const dragHints: Array<{
  id: DragHint;
  label: string;
  note: string;
}> = [
  {
    id: 'current',
    label: 'Today',
    note: 'Production: the bone dips toward Patchy when left alone. Nothing says “drag”.',
  },
  {
    id: 'hand',
    label: 'A. Hand demo',
    note: 'A finger presses the bone and carries a ghost of it to Patchy’s mouth, on a loop until you touch it.',
  },
  {
    id: 'touch',
    label: 'A2. Touch dot',
    note: 'A’s motion with no hand: a glowing touch point presses the bone and pulls a ghost of it to Patchy, leaving a short trail.',
  },
  {
    id: 'paw',
    label: 'A3. Patchy’s paw',
    note: 'A’s motion, led by Patchy’s own paw, so the hint belongs to the scene.',
  },
  {
    id: 'hand3d',
    label: 'A4. 3D hand',
    note: 'A’s motion with a soft 3D hand in the character style instead of the flat one.',
  },
  {
    id: 'path',
    label: 'B. Drawn path',
    note: 'A flowing dotted arc from the bone to a pulsing target on Patchy’s mouth. Shows where, not how.',
  },
  {
    id: 'bubble',
    label: 'C. Patchy asks',
    note: 'Patchy’s speech bubble is up from the start, and a finger tugs the bone toward him.',
  },
  {
    id: 'chip',
    label: 'D. Spelled out',
    note: 'A “Drag the bone to Patchy” pill between them, with a finger sliding down inside it.',
  },
];

const BONE_SELECTOR = '[data-funnel-track="commitment bone"]';
const DOG_SELECTOR = 'img[alt="Patchy looking up"]';
/** Mouth position inside the dog image, as the component defines it. */
const MOUTH = { x: 0.74, y: 0.3 };
/** The fingertip inside the hand drawing's 48 × 48 box. */
const TIP = { x: 23, y: 3 };

interface Point {
  x: number;
  y: number;
}

interface Scene {
  bone: Point;
  mouth: Point;
  dog: DOMRect;
}

/** Where the bone and Patchy are, every frame, once the bone can be dragged. */
const useScene = (): Scene | undefined => {
  const [scene, setScene] = useState<Scene>();

  useEffect(() => {
    let frame = 0;
    const read = () => {
      const button = document.querySelector<HTMLButtonElement>(BONE_SELECTOR);
      const dog = document.querySelector<HTMLImageElement>(DOG_SELECTOR);
      // The slot, not the button: the button floats, the slot holds still.
      const slot = button?.parentElement;
      if (!button || button.disabled || !slot || !dog?.offsetHeight) {
        setScene(undefined);
      } else {
        const boneBox = slot.getBoundingClientRect();
        const dogBox = dog.getBoundingClientRect();
        setScene({
          bone: {
            x: boneBox.left + boneBox.width / 2,
            y: boneBox.top + boneBox.height / 2,
          },
          mouth: {
            x: dogBox.left + dogBox.width * MOUTH.x,
            y: dogBox.top + dogBox.height * MOUTH.y,
          },
          dog: dogBox,
        });
      }
      frame = window.requestAnimationFrame(read);
    };
    frame = window.requestAnimationFrame(read);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return scene;
};

/** Hidden for good once the bone is first touched. */
const useHasTouched = (): boolean => {
  const [hasTouched, setHasTouched] = useState(false);

  useEffect(() => {
    const onDown = (event: PointerEvent) => {
      if ((event.target as Element)?.closest?.(BONE_SELECTOR)) {
        setHasTouched(true);
      }
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, []);

  return hasTouched;
};

/** Milliseconds into a repeating cycle. */
const useCycle = (period: number): number => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setTime((now - start) % period);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [period]);

  return time;
};

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const between = (time: number, from: number, to: number) =>
  clamp01((time - from) / (to - from));

/** A gentle bow to the left, so the path reads as a motion, not a line. */
const control = ({ bone, mouth }: Scene): Point => ({
  x: (bone.x + mouth.x) / 2 - 70,
  y: (bone.y + mouth.y) / 2,
});

const onCurve = (scene: Scene, t: number): Point => {
  const c = control(scene);
  const u = 1 - t;
  return {
    x: u * u * scene.bone.x + 2 * u * t * c.x + t * t * scene.mouth.x,
    y: u * u * scene.bone.y + 2 * u * t * c.y + t * t * scene.mouth.y,
  };
};

/** A pointing hand, white with a dark outline so it reads on both themes. */
const Hand = ({
  at,
  isPressed = false,
  opacity = 1,
  size = 48,
}: {
  at: Point;
  isPressed?: boolean;
  opacity?: number;
  size?: number;
}): ReactElement => {
  const scale = size / 48;

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className="pointer-events-none fixed drop-shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.35)]"
      style={{
        left: at.x - TIP.x * scale,
        top: at.y - TIP.y * scale,
        opacity,
        transform: `scale(${isPressed ? 0.88 : 1})`,
        transformOrigin: `${TIP.x * scale}px ${TIP.y * scale}px`,
        transition: 'transform 140ms ease-out',
      }}
    >
      <path
        d="M19 25V7a4 4 0 0 1 8 0v12a3.5 3.5 0 0 1 7 0v2a3 3 0 0 1 6 0v9c0 8-5 14-12 14h-3c-4 0-7-2-9.5-5.5L9 32a3.2 3.2 0 0 1 4.6-4.4L19 32Z"
        fill="white"
        stroke="black"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M27 19v6M34 21v5"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

/** A ring that spreads from where the finger lands. */
const Ripple = ({ at, t }: { at: Point; t: number }): ReactElement | null =>
  t <= 0 || t >= 1 ? null : (
    <span
      aria-hidden
      className="pointer-events-none fixed rounded-full border-2 border-text-primary"
      style={{
        left: at.x,
        top: at.y,
        width: 56,
        height: 56,
        opacity: 1 - t,
        transform: `translate(-50%, -50%) scale(${0.4 + t})`,
      }}
    />
  );

// Art from Agent Smith, 112px for a 56px pointer; tip is where it touches.
const pointerArt = {
  paw: {
    src: new URL('./assets/patchy-paw-pointer.webp', import.meta.url).href,
    tip: { x: 37, y: 100 },
  },
  hand3d: {
    src: new URL('./assets/hand-pointer.webp', import.meta.url).href,
    tip: { x: 10, y: 86 },
  },
};

const ArtPointer = ({
  art,
  at,
  isPressed,
  opacity,
}: {
  art: keyof typeof pointerArt;
  at: Point;
  isPressed: boolean;
  opacity: number;
}): ReactElement => {
  const { src, tip } = pointerArt[art];
  const size = 64;
  const scale = size / 112;

  return (
    <img
      aria-hidden
      src={src}
      alt=""
      className="pointer-events-none fixed drop-shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.35)]"
      style={{
        width: size,
        height: size,
        left: at.x - tip.x * scale,
        top: at.y - tip.y * scale,
        opacity,
        transform: `scale(${isPressed ? 0.88 : 1})`,
        transformOrigin: `${tip.x * scale}px ${tip.y * scale}px`,
        transition: 'transform 140ms ease-out',
      }}
    />
  );
};

const HandDemo = ({
  scene,
  art,
}: {
  scene: Scene;
  art?: keyof typeof pointerArt;
}): ReactElement => {
  const time = useCycle(3400);
  const press = between(time, 300, 450);
  const travel = ease(between(time, 600, 1800));
  const release = between(time, 1800, 2200);
  const isMoving = time >= 600 && time < 1800;
  const at = time < 1800 ? onCurve(scene, travel) : scene.mouth;
  const appear = between(time, 0, 300);
  const opacity = time < 1800 ? appear : 1 - between(time, 2000, 2400);

  return (
    <>
      <Ripple at={scene.bone} t={press} />
      {isMoving && (
        <img
          aria-hidden
          src={cloudinaryPatchyBone}
          alt=""
          className="pointer-events-none fixed w-28 opacity-50"
          style={{
            left: at.x,
            top: at.y,
            transform: 'translate(-50%, -50%) rotate(-8deg)',
          }}
        />
      )}
      <Ripple at={scene.mouth} t={release} />
      {art ? (
        <ArtPointer
          art={art}
          at={at}
          isPressed={time >= 450 && time < 1800}
          opacity={opacity}
        />
      ) : (
        <Hand
          at={at}
          isPressed={time >= 450 && time < 1800}
          opacity={opacity}
          size={56}
        />
      )}
    </>
  );
};

const TouchDemo = ({ scene }: { scene: Scene }): ReactElement => {
  const time = useCycle(3400);
  const press = between(time, 300, 450);
  const travel = ease(between(time, 600, 1800));
  const isMoving = time >= 600 && time < 1800;
  const isDown = time >= 300 && time < 1800;
  const at = time < 1800 ? onCurve(scene, travel) : scene.mouth;
  const opacity =
    time < 1800 ? between(time, 0, 300) : 1 - between(time, 1800, 2200);

  return (
    <>
      <Ripple at={scene.bone} t={press} />
      {isMoving &&
        [0.16, 0.12, 0.08, 0.04].map((lag, index) => {
          const dot = onCurve(scene, Math.max(0, travel - lag));
          return (
            <span
              key={lag}
              aria-hidden
              className="pointer-events-none fixed size-4 rounded-full bg-text-primary"
              style={{
                left: dot.x,
                top: dot.y,
                opacity: 0.12 + index * 0.08,
                transform: `translate(-50%, -50%) scale(${0.5 + index * 0.15})`,
              }}
            />
          );
        })}
      {isMoving && (
        <img
          aria-hidden
          src={cloudinaryPatchyBone}
          alt=""
          className="pointer-events-none fixed w-28 opacity-50"
          style={{
            left: at.x,
            top: at.y,
            transform: 'translate(-50%, -50%) rotate(-8deg)',
          }}
        />
      )}
      <Ripple at={scene.mouth} t={between(time, 1800, 2200)} />
      <span
        aria-hidden
        className="pointer-events-none fixed size-12 rounded-full border-2 border-text-primary shadow-2 backdrop-blur-sm"
        style={{
          left: at.x,
          top: at.y,
          opacity,
          transform: `translate(-50%, -50%) scale(${isDown ? 0.8 : 1})`,
          transition: 'transform 140ms ease-out',
        }}
      >
        <span
          className="absolute inset-0 rounded-full bg-text-primary"
          style={{ opacity: 0.2 }}
        />
      </span>
    </>
  );
};

const DrawnPath = ({ scene }: { scene: Scene }): ReactElement => {
  const time = useCycle(1600);
  const c = control(scene);
  // Stop short of the mouth, so the arrowhead sits on the target's edge.
  const end = onCurve(scene, 0.92);
  // Start below the bone, not under it.
  const start = onCurve(scene, 0.2);
  const pulse = between(time, 0, 1600);

  return (
    <>
      <svg
        aria-hidden
        className="pointer-events-none fixed inset-0 size-full text-accent-cheese-default"
      >
        <defs>
          <marker
            id="fp-arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0 0 10 5 0 10Z" fill="currentColor" />
          </marker>
        </defs>
        <path
          d={`M${start.x} ${start.y} Q${c.x} ${c.y} ${end.x} ${end.y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="2 12"
          strokeDashoffset={-pulse * 14 * 4}
          markerEnd="url(#fp-arrow)"
        />
      </svg>
      <span
        aria-hidden
        className="pointer-events-none fixed rounded-full border-2 border-accent-cheese-default"
        style={{
          left: scene.mouth.x,
          top: scene.mouth.y,
          width: 64,
          height: 64,
          opacity: 1 - pulse,
          transform: `translate(-50%, -50%) scale(${0.6 + pulse * 0.6})`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none fixed size-4 rounded-full bg-accent-cheese-default"
        style={{
          left: scene.mouth.x,
          top: scene.mouth.y,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  );
};

/** The finger presses the bone and tugs it a short way toward Patchy. */
const Tug = ({ scene, size = 48 }: { scene: Scene; size?: number }) => {
  const time = useCycle(2000);
  const tug = ease(between(time, 400, 1100)) - ease(between(time, 1300, 1700));
  const at = onCurve(scene, 0.06 + tug * 0.22);
  const opacity = 1 - between(time, 1500, 1900);

  return (
    <>
      <Ripple at={scene.bone} t={between(time, 200, 600)} />
      <Hand
        at={{ x: at.x + 18, y: at.y + 10 }}
        isPressed={time >= 250 && time < 1300}
        opacity={Math.min(opacity, between(time, 0, 200))}
        size={size}
      />
    </>
  );
};

const PatchyAsks = ({ scene }: { scene: Scene }): ReactElement => (
  <>
    {/* The production bubble, up and to the left of his head. */}
    <span
      aria-hidden
      className="pointer-events-none fixed w-max max-w-[9rem] rounded-16 rounded-br-2 border border-border-subtlest-tertiary bg-white px-3 py-2 text-right font-bold text-black shadow-2 typo-callout"
      style={{
        left: scene.dog.left + scene.dog.width / 2 - 40,
        top: scene.dog.top + scene.dog.height * 0.2,
        transform: 'translate(-100%, -100%)',
      }}
    >
      Drag the bone to me!
      <span
        aria-hidden
        className="absolute -bottom-1.5 right-2 size-3 rotate-45 border-b border-r border-border-subtlest-tertiary bg-white"
      />
    </span>
    <Tug scene={scene} />
  </>
);

const SpelledOut = ({ scene }: { scene: Scene }): ReactElement => {
  const time = useCycle(1400);
  const slide = ease(between(time, 0, 900));
  const mid = {
    x: (scene.bone.x + scene.mouth.x) / 2,
    y: scene.bone.y + (scene.dog.top - scene.bone.y) * 0.55,
  };

  return (
    <span
      aria-hidden
      className="pointer-events-none fixed flex items-center gap-2 whitespace-nowrap rounded-max border border-border-subtlest-tertiary bg-background-default py-2 pl-2 pr-4 font-bold text-text-primary shadow-2 typo-callout"
      style={{
        left: scene.bone.x,
        top: mid.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <span className="relative h-8 w-6 overflow-hidden">
        <svg
          viewBox="0 0 48 48"
          className="absolute left-0 size-6"
          style={{ top: -4 + slide * 12, opacity: 1 - between(time, 900, 1300) }}
        >
          <path
            d="M19 25V7a4 4 0 0 1 8 0v12a3.5 3.5 0 0 1 7 0v2a3 3 0 0 1 6 0v9c0 8-5 14-12 14h-3c-4 0-7-2-9.5-5.5L9 32a3.2 3.2 0 0 1 4.6-4.4L19 32Z"
            fill="white"
            stroke="black"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      Drag the bone to Patchy
      <span className="text-text-tertiary">↓</span>
    </span>
  );
};

const hints: Record<
  Exclude<DragHint, 'current'>,
  (props: { scene: Scene }) => ReactElement
> = {
  hand: HandDemo,
  touch: TouchDemo,
  paw: ({ scene }) => <HandDemo scene={scene} art="paw" />,
  hand3d: ({ scene }) => <HandDemo scene={scene} art="hand3d" />,
  path: DrawnPath,
  bubble: PatchyAsks,
  chip: SpelledOut,
};

// The new hints replace the production dip, which would fight them: the
// bone keeps its float while idle instead.
const noDipCss = `
@keyframes fp-sb-float {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-0.625rem) rotate(3deg); }
}
${BONE_SELECTOR}[class*="ghost"] img {
  animation: fp-sb-float 2.8s ease-in-out infinite !important;
}
`;

export const DragHintOverlay = ({
  hint,
}: {
  hint: DragHint;
}): ReactElement | null => {
  const scene = useScene();
  const hasTouched = useHasTouched();

  if (hint === 'current') {
    return null;
  }

  const Hint = hints[hint];

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: noDipCss }} />
      {scene && !hasTouched && (
        <div className="pointer-events-none fixed inset-0 z-tooltip">
          <Hint scene={scene} />
        </div>
      )}
    </>
  );
};
