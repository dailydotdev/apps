import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import { toSquadHandle } from '@dailydotdev/shared/src/features/squads/lib/handle';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import { agentMarks } from './agentMarks';
import { CrewOnBase, PLAZA_SKY } from './crewOnBase';
import { FullPagePreview } from './preview';

// The right side of the company step: ten directions for "this is yours". Every
// one reacts as the name is typed, and starts empty, waiting to be given a name.
// Patterns from other onboardings (Cal.com, Slack, Arc) are on Design choices.

const CREW = '/startups-onboarding/cover-crew.webp';
const SKY = '#00021F';
const LILAC = '#D8B4FE';
const INK = '#0F0F12';
const EMPTY = 'Your company';

const NIGHT =
  'radial-gradient(80% 50% at 25% 15%, rgba(124,107,234,.45), transparent 70%), radial-gradient(80% 55% at 85% 90%, rgba(186,86,225,.4), transparent 70%), #101014';

const MOTION = `
@keyframes startupsDrop { from { opacity: 0; transform: translateY(-60px) rotate(-8deg); } to { opacity: 1; transform: none; } }
@keyframes startupsScroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
@keyframes startupsCaret { 50% { opacity: 0; } }
@keyframes startupsFlip { from { opacity: 0; transform: scaleY(0); } to { opacity: 1; transform: none; } }
.startups-seat { transform-box: fill-box; transform-origin: center; animation: startupsFlip .25s cubic-bezier(.23,1,.32,1) both; }
@keyframes startupsSettle { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .startups-drop, .startups-scroll, .startups-settle { animation: none !important; }
  .startups-seat { animation: none !important; }
}
`;

const shownName = (name: string): string => name.trim() || EMPTY;

/** Big for a short name, smaller for a long one, so it always fits. */
const fit = (name: string, max: number, width: number): number =>
  Math.min(max, width / (Math.max(name.length, 1) * 0.56));

const hashOf = (text: string): number =>
  [...text.toLowerCase()].reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) % 9973,
    7,
  );

const Box = ({
  children,
  background = NIGHT,
  className = '',
}: {
  children: ReactNode;
  background?: string;
  className?: string;
}): ReactElement => (
  <div
    aria-hidden
    className={`relative h-full w-full overflow-hidden rounded-16 ${className}`}
    style={{ background, color: '#fff' }}
  >
    <style dangerouslySetInnerHTML={{ __html: MOTION }} />
    {children}
  </div>
);

/** The crew's picture, pinned to the bottom, with drawing in its coordinates. */
const Scene = ({
  drawing,
  children,
}: {
  drawing?: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <Box background={SKY}>
    <div
      className="absolute inset-x-0 bottom-0"
      style={{ aspectRatio: '3 / 4' }}
    >
      <img src={CREW} alt="" className="absolute inset-0 size-full" />
      {drawing && (
        <svg
          viewBox="0 0 1200 1600"
          className="absolute inset-0 size-full"
          fill="none"
        >
          {drawing}
        </svg>
      )}
    </div>
    {children}
  </Box>
);

/** One member of the crew, cropped from the picture. */
const Face = ({
  x,
  y,
  size = 300,
  style,
}: {
  x: number;
  y: number;
  size?: number;
  style?: CSSProperties;
}): ReactElement => (
  <svg
    viewBox={`${x - size / 2} ${y - size / 2} ${size} ${size}`}
    preserveAspectRatio="xMidYMid slice"
    className="size-full"
    style={style}
  >
    <image href={CREW} width="1200" height="1600" />
  </svg>
);

const crew = [
  { who: 'Maya', role: 'Head of Launches', x: 615, y: 1200, size: 280 },
  { who: 'Sam', role: 'Chief Shipping Officer', x: 755, y: 1160, size: 280 },
  { who: 'Whiskers', role: 'Head of Code Review', x: 270, y: 1370, size: 300 },
  { who: 'Pip', role: 'VP of Standups', x: 985, y: 1390, size: 300 },
  { who: 'Bolt', role: 'Principal Robot', x: 505, y: 1240, size: 230 },
  { who: 'Lottie', role: 'Developer Advocate', x: 755, y: 1430, size: 280 },
];

// 1. A card stunt: a 5x7 letter for each character, flipped by the seats.
const LETTERS: Record<string, string> = {
  A: '01110100011000111111100011000110001',
  B: '11110100011000111110100011000111110',
  C: '01110100011000010000100001000101110',
  D: '11110100011000110001100011000111110',
  E: '11111100001000011110100001000011111',
  F: '11111100001000011110100001000010000',
  G: '01110100011000010111100011000101111',
  H: '10001100011000111111100011000110001',
  I: '01110001000010000100001000010001110',
  J: '00111000100001000010000101001001100',
  K: '10001100101010011000101001001010001',
  L: '10000100001000010000100001000011111',
  M: '10001110111010110101100011000110001',
  N: '10001110011010110011100011000110001',
  O: '01110100011000110001100011000101110',
  P: '11110100011000111110100001000010000',
  Q: '01110100011000110001101011001001101',
  R: '11110100011000111110101001001010001',
  S: '01111100001000001110000010000111110',
  T: '11111001000010000100001000010000100',
  U: '10001100011000110001100011000101110',
  V: '10001100011000110001100010101000100',
  W: '10001100011000110101101011101110001',
  X: '10001100010101000100010101000110001',
  Y: '10001100010101000100001000010000100',
  Z: '11111000010001000100010001000011111',
  '0': '01110100011001110101110011000101110',
  '1': '00100011000010000100001000010001110',
  '2': '01110100010000100010001000100011111',
  '3': '11110000010000101110000010000111110',
  '4': '00010001100101010010111110001000010',
  '5': '11111100001111000001000011000101110',
  '6': '00110010001000011110100011000101110',
  '7': '11111000010001000100010000100001000',
  '8': '01110100011000101110100011000101110',
  '9': '01110100011000101111000010001001100',
  '.': '00000000000000000000000000110001100',
  ',': '00000000000000000000001100010001000',
  '-': '00000000000000011111000000000000000',
  _: '00000000000000000000000000000011111',
  "'": '00100001000100000000000000000000000',
  '!': '00100001000010000100001000000000100',
  '?': '01110100010000100010001000000000100',
  '&': '01100100101010001000101011001001101',
  '+': '00000001000010011111001000010000000',
  '/': '00001000010001000100010001000010000',
  ':': '00000011000110000000011000110000000',
  '@': '01110100011011110101101111000001110',
  '#': '01010010101111101010111110101001010',
  '(': '00010001000100001000010000010000010',
  ')': '01000001000001000010000100010001000',
};
// Any other character, such as a non-Latin one, still gets a card of its own.
const UNKNOWN_LETTER = '11111100011000110001100011000111111';
const MAX_CHARACTERS = 120;
const LETTER_WIDTH = 6;
const LETTER_HEIGHT = 8;
const SEAT_MARGIN = 2;
// The room above the crew's heads, and the biggest a seat gets, in pixels.
const STUNT_WIDTH = 460;
const STUNT_HEIGHT = 340;
const MAX_SEAT = 20;
const MAX_WORD = 16;

const wrapWords = (text: string, width: number): string[] => {
  const lines: string[] = [];
  let line = '';

  text.split(/\s+/).forEach((word) => {
    let rest = word;

    if (line && line.length + 1 + rest.length > width) {
      lines.push(line);
      line = '';
    }

    while (rest.length > width) {
      if (line) {
        lines.push(line);
        line = '';
      }
      lines.push(rest.slice(0, width));
      rest = rest.slice(width);
    }

    line = line ? `${line} ${rest}` : rest;
  });

  return line ? [...lines, line] : lines;
};

const toSeats = (lines: string[]): { columns: number; rows: number } => ({
  columns:
    Math.max(...lines.map(({ length }) => length)) * LETTER_WIDTH -
    1 +
    SEAT_MARGIN * 2,
  rows: lines.length * LETTER_HEIGHT - 1 + SEAT_MARGIN * 2,
});

const seatSize = ({ columns, rows }: { columns: number; rows: number }) =>
  Math.min(STUNT_WIDTH / columns, STUNT_HEIGHT / rows);

/** Wraps the name the way that makes its letters as big as they can be. */
const layOutStunt = (text: string): string[] => {
  // Words stay whole, unless one is too long to ever fit at a readable size.
  const longestWord = Math.max(...text.split(' ').map(({ length }) => length));
  const narrowest = Math.min(longestWord, MAX_WORD);
  let best = wrapWords(text, narrowest);

  for (let width = narrowest; width <= text.length; width += 1) {
    const lines = wrapWords(text, width);
    const size = seatSize(toSeats(lines));
    const bestSize = seatSize(toSeats(best));

    if (
      Math.min(size, MAX_SEAT) > Math.min(bestSize, MAX_SEAT) ||
      (Math.min(size, MAX_SEAT) === Math.min(bestSize, MAX_SEAT) &&
        lines.length < best.length)
    ) {
      best = lines;
    }
  }

  return best;
};

const normalize = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CHARACTERS);

export const StuntVisual = ({ name }: { name: string }): ReactElement => {
  const hasName = !!name.trim();
  const lines = layOutStunt(normalize(name) || EMPTY.toUpperCase());
  const { columns, rows } = toSeats(lines);
  const patternId = `startups-seats-${columns}-${rows}`;

  return (
    <Box background={PLAZA_SKY}>
      <CrewOnBase />
      <div
        className="absolute flex items-center justify-center"
        style={{ left: '6%', right: '6%', top: '6%', height: '54%' }}
      >
        <svg
          viewBox={`0 0 ${columns} ${rows}`}
          style={{
            width: '100%',
            maxWidth: columns * MAX_SEAT,
            maxHeight: '100%',
            borderRadius: 12,
          }}
        >
          <defs>
            <pattern
              id={patternId}
              width="1"
              height="1"
              patternUnits="userSpaceOnUse"
            >
              <rect
                x=".07"
                y=".07"
                width=".86"
                height=".86"
                rx=".2"
                fill="rgba(124,107,234,.2)"
              />
            </pattern>
          </defs>
          <rect width={columns} height={rows} fill={`url(#${patternId})`} />
          {lines.flatMap((line, lineIndex) => {
            const left = Math.floor(
              (columns - (line.length * LETTER_WIDTH - 1)) / 2,
            );

            return [...line].flatMap((char, charIndex) =>
              char === ' '
                ? []
                : [...(LETTERS[char] ?? UNKNOWN_LETTER)].flatMap(
                    (bit, bitIndex) => {
                      if (bit !== '1') {
                        return [];
                      }

                      const x =
                        left + charIndex * LETTER_WIDTH + (bitIndex % 5);
                      const y =
                        SEAT_MARGIN +
                        lineIndex * LETTER_HEIGHT +
                        Math.floor(bitIndex / 5);

                      return (
                        <rect
                          key={`${x}:${y}`}
                          className="startups-seat"
                          x={x + 0.07}
                          y={y + 0.07}
                          width=".86"
                          height=".86"
                          rx=".2"
                          fill={LILAC}
                          fillOpacity={hasName ? 1 : 0.35}
                          style={{
                            animationDelay: `${Math.round((x / columns) * 240)}ms`,
                          }}
                        />
                      );
                    },
                  ),
            );
          })}
        </svg>
      </div>
    </Box>
  );
};

/** 2. The crew stacks a block for every letter. */
const BLOCK_COLORS = [LILAC, '#FF9CDA', '#7DE3D0', '#FFD98A'];

export const BlocksVisual = ({ name }: { name: string }): ReactElement => {
  const letters = [...name.trim().slice(0, 18)];
  const size = letters.length > 10 ? 44 : 64;

  return (
    <Box background={PLAZA_SKY}>
      <CrewOnBase />
      <div
        className="absolute flex flex-wrap content-end justify-center gap-2 px-8"
        style={{ left: 0, right: 0, top: '10%', height: '36%' }}
      >
        {letters.length === 0 &&
          [0, 1, 2, 3].map((slot) => (
            <span
              key={slot}
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                border: `2px dashed ${LILAC}`,
                opacity: 0.35,
              }}
            />
          ))}
        {letters.map((letter, index) => (
          <span
            // eslint-disable-next-line react/no-array-index-key -- a letter's place is its identity, so only new ones drop in
            key={`${index}-${letter}`}
            className="startups-drop flex items-center justify-center font-bold"
            style={{
              width: size,
              height: size,
              borderRadius: 14,
              fontSize: size * 0.6,
              color: INK,
              background: BLOCK_COLORS[index % BLOCK_COLORS.length],
              boxShadow:
                'inset 0 -6px 0 rgba(0,0,0,.2), 0 12px 24px -8px rgba(0,0,0,.6)',
              animation: 'startupsDrop .35s cubic-bezier(.23,1,.32,1) both',
              whiteSpace: 'pre',
            }}
          >
            {letter}
          </span>
        ))}
      </div>
    </Box>
  );
};

/** 3. Your company's first meeting. Everyone's already there. */
export const AllHandsVisual = ({ name }: { name: string }): ReactElement => {
  const shown = shownName(name);

  return (
    <Box className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <span
          className="min-w-0 truncate font-bold tracking-tight"
          style={{ fontSize: 26, opacity: name.trim() ? 1 : 0.5 }}
        >
          {`${shown} all-hands`}
        </span>
        <span
          className="shrink-0 rounded-8 px-2 py-0.5 font-bold typo-caption1"
          style={{ background: 'rgba(255,255,255,.1)' }}
        >
          Day one
        </span>
      </div>
      <div
        className="grid min-h-0 flex-1 gap-2"
        style={{
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'repeat(3, 1fr)',
        }}
      >
        {crew.slice(0, 5).map(({ who, x, y, size }) => (
          <div
            key={who}
            className="relative min-h-0 overflow-hidden rounded-12"
            style={{ background: SKY }}
          >
            <Face x={x} y={y} size={size} />
            <span
              className="absolute bottom-2 left-2 max-w-[90%] truncate rounded-8 px-2 py-0.5 font-bold typo-caption1"
              style={{ background: 'rgba(0,0,0,.6)' }}
            >
              {name.trim() ? `${who} · ${name.trim()}` : who}
            </span>
          </div>
        ))}
        <div
          className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-12"
          style={{
            background: 'rgba(216,180,254,.14)',
            boxShadow: `inset 0 0 0 2px ${LILAC}`,
          }}
        >
          <span
            className="flex items-center justify-center rounded-full font-bold"
            style={{
              width: 72,
              height: 72,
              fontSize: 32,
              background: LILAC,
              color: INK,
            }}
          >
            {name.trim() ? name.trim()[0].toUpperCase() : '?'}
          </span>
          <span
            className="absolute bottom-2 left-2 rounded-8 px-2 py-0.5 font-bold typo-caption1"
            style={{ background: 'rgba(0,0,0,.6)' }}
          >
            You, founder
          </span>
        </div>
      </div>
    </Box>
  );
};

/** 4. Your name picks a member of the crew, who joins you from day one. */
export const TeammateVisual = ({ name }: { name: string }): ReactElement => {
  const hasName = !!name.trim();
  const mate = crew[hashOf(name.trim()) % crew.length];

  return (
    <Box className="flex flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="font-bold typo-callout" style={{ opacity: 0.7 }}>
        {hasName
          ? 'Your founding teammate'
          : 'Type a name to meet your teammate'}
      </span>
      <div
        key={hasName ? mate.who : 'none'}
        className="startups-settle overflow-hidden rounded-full"
        style={{
          width: 300,
          height: 300,
          background: SKY,
          boxShadow: `0 0 0 6px ${LILAC}, 0 30px 80px -10px rgba(124,107,234,.8)`,
          filter: hasName ? undefined : 'grayscale(1) brightness(.5)',
          animation: 'startupsSettle .2s cubic-bezier(.23,1,.32,1) both',
        }}
      >
        <Face x={mate.x} y={mate.y} size={mate.size} />
      </div>
      {hasName && (
        <div className="flex flex-col gap-1">
          <span
            className="font-bold tracking-tight"
            style={{ fontSize: 40, lineHeight: 1.1 }}
          >
            {mate.who}
          </span>
          <span className="text-pretty typo-title3" style={{ opacity: 0.8 }}>
            {`${mate.role}, ${name.trim()}`}
          </span>
        </div>
      )}
    </Box>
  );
};

const Caret = (): ReactElement => (
  <span
    style={{
      display: 'inline-block',
      width: '.55em',
      height: '1em',
      marginLeft: 2,
      verticalAlign: 'text-bottom',
      background: LILAC,
      animation: 'startupsCaret 1s steps(1) infinite',
    }}
  />
);

/** 5. A developer installing you: the moment founders are selling toward. */
export const TerminalVisual = ({ name }: { name: string }): ReactElement => {
  const slug = name.trim() ? toSquadHandle(name) : 'yourcompany';
  const dim = name.trim() ? 1 : 0.45;

  return (
    <Box className="flex flex-col justify-center gap-5 p-6">
      <p
        className="text-balance font-bold tracking-tight"
        style={{ fontSize: 30, lineHeight: 1.15 }}
      >
        Somewhere, a developer just found you.
      </p>
      <div
        className="flex flex-col overflow-hidden rounded-12"
        style={{
          background: '#0B0B10',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.12)',
        }}
      >
        <div
          className="flex items-center gap-1.5 px-4 py-3"
          style={{ background: 'rgba(255,255,255,.05)' }}
        >
          {['#FF5F57', '#FEBC2E', '#28C840'].map((color) => (
            <span
              key={color}
              className="size-3 rounded-full"
              style={{ background: color }}
            />
          ))}
        </div>
        <pre
          className="whitespace-pre-wrap break-all p-5 font-mono"
          style={{ fontSize: 16, lineHeight: 1.7 }}
        >
          <span style={{ opacity: 0.5 }}>$ </span>
          npm install{' '}
          <span style={{ color: LILAC, opacity: dim }}>{`@${slug}/sdk`}</span>
          {'\n'}
          <span style={{ opacity: 0.5 }}>added 1 package in 2s</span>
          {'\n\n'}
          <span style={{ color: '#FF9CDA' }}>import</span>
          {' { client } '}
          <span style={{ color: '#FF9CDA' }}>from</span>{' '}
          <span
            style={{ color: '#7DE3D0', opacity: dim }}
          >{`'@${slug}/sdk'`}</span>
          <Caret />
        </pre>
      </div>
    </Box>
  );
};

/** 6. A feed flying past, and the one post that stops it. */
export const ScrollVisual = ({ name }: { name: string }): ReactElement => {
  const hasName = !!name.trim();
  const shown = shownName(name);

  return (
    <Box>
      <div
        className="startups-scroll absolute inset-x-6 top-0 flex flex-col gap-3"
        style={{
          filter: 'blur(3px)',
          opacity: 0.4,
          animation: 'startupsScroll 14s linear infinite',
          animationPlayState: hasName ? 'paused' : 'running',
        }}
      >
        {Array.from({ length: 16 }, (_, card) => (
          <div
            key={card}
            className="flex flex-col gap-3 rounded-12 p-4"
            style={{ background: '#1C1F26' }}
          >
            <span
              className="h-4 rounded-6"
              style={{
                width: `${50 + (card % 4) * 12}%`,
                background: 'rgba(255,255,255,.25)',
              }}
            />
            <span
              className="rounded-12"
              style={{
                height: 96,
                background: `linear-gradient(135deg, hsl(${(card * 47) % 360} 60% 45%), hsl(${(card * 47 + 60) % 360} 60% 35%))`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div
          key={hasName ? 'post' : 'empty'}
          className="startups-settle flex w-full flex-col gap-4 rounded-16 p-6"
          style={{
            background: '#1C1F26',
            boxShadow: `0 0 0 2px ${hasName ? LILAC : 'rgba(255,255,255,.2)'}, 0 40px 80px -10px rgba(0,0,0,.9)`,
            animation: 'startupsSettle .2s cubic-bezier(.23,1,.32,1) both',
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex size-12 items-center justify-center rounded-full font-bold"
              style={{ background: LILAC, color: INK, fontSize: 22 }}
            >
              {hasName ? shown[0].toUpperCase() : '?'}
            </span>
            <span className="min-w-0 flex-1 truncate font-bold typo-title3">
              {shown}
            </span>
          </div>
          <p
            className="text-balance font-bold tracking-tight"
            style={{ fontSize: 32, lineHeight: 1.15 }}
          >
            {hasName
              ? `Hello, developers. We're ${name.trim()}.`
              : 'The post that stops the scroll.'}
          </p>
          <span
            className="rounded-16"
            style={{
              height: 150,
              background: 'linear-gradient(135deg, #7C6BEA, #BA56E1)',
            }}
          />
        </div>
      </div>
    </Box>
  );
};

/** 7. A coding agent, recommending you to a developer. */
export const AgentVisual = ({ name }: { name: string }): ReactElement => {
  const marks = [
    agentMarks['claude-code'],
    agentMarks.cursor,
    agentMarks.codex,
  ];

  return (
    <Box className="flex flex-col justify-center gap-5 p-6">
      <div className="flex items-center gap-2">
        {marks.map((mark, index) => (
          <span
            key={mark.tile}
            className="flex size-12 items-center justify-center rounded-12"
            style={{
              background: mark.tile,
              opacity: index === 0 ? 1 : 0.4,
            }}
          >
            <svg
              viewBox={mark.glyph.viewBox}
              className="size-7"
              fill="#fff"
              aria-hidden
            >
              {mark.glyph.paths.map((d) => (
                <path key={d} d={d} fillRule="evenodd" />
              ))}
            </svg>
          </span>
        ))}
      </div>
      <p
        className="self-end rounded-16 px-4 py-3 typo-title3"
        style={{ background: 'rgba(255,255,255,.1)' }}
      >
        What should I use for this?
      </p>
      <p
        className="text-pretty font-bold tracking-tight"
        style={{ fontSize: 34, lineHeight: 1.2 }}
      >
        Developers on daily.dev keep mentioning{' '}
        <span style={{ color: LILAC }}>{name.trim()}</span>
        <Caret />
      </p>
      <div className="flex flex-col gap-2" style={{ opacity: 0.2 }}>
        {[100, 88, 60].map((width) => (
          <span
            key={width}
            className="h-3 rounded-6"
            style={{ width: `${width}%`, background: '#fff' }}
          />
        ))}
      </div>
    </Box>
  );
};

/** 8. A colour of your own, worked out from your name. */
export const BrandVisual = ({ name }: { name: string }): ReactElement => {
  const hasName = !!name.trim();
  const hue = hashOf(name.trim()) % 360;
  const blob = (offset: number): string =>
    hasName ? `hsl(${(hue + offset) % 360} 80% 60%)` : 'hsl(250 10% 30%)';
  const transition = 'background-color .4s cubic-bezier(.23,1,.32,1)';
  const shown = shownName(name);

  return (
    <Box background="#101014">
      <div
        className="startups-glow startups-glow-a"
        style={{
          background: blob(0),
          width: 520,
          height: 520,
          left: '-14%',
          top: '-6%',
          transition,
        }}
      />
      <div
        className="startups-glow startups-glow-b"
        style={{
          background: blob(70),
          width: 560,
          height: 560,
          right: '-18%',
          bottom: '-10%',
          transition,
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 text-center">
        <span
          className="flex items-center justify-center rounded-16 font-bold"
          style={{
            width: 136,
            height: 136,
            fontSize: 72,
            color: '#fff',
            background: 'rgba(0,0,0,.35)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.3)',
          }}
        >
          {hasName ? shown[0].toUpperCase() : '?'}
        </span>
        <span
          className="font-bold tracking-tight"
          style={{
            fontSize: fit(shown, 68, 720),
            lineHeight: 1.1,
            opacity: hasName ? 1 : 0.5,
          }}
        >
          {shown}
        </span>
      </div>
    </Box>
  );
};

/** 9. The real page, already yours, with nothing to add yet. */
export const RealPageVisual = ({ name }: { name: string }): ReactElement => (
  <FullPagePreview content={{ name, plan: SquadPlan.Starter }} />
);

/** 10. The crew holds up a banner with the name on it. */
export const BannerVisual = ({ name }: { name: string }): ReactElement => {
  const shown = shownName(name);
  const hasName = !!name.trim();

  return (
    <Scene
      drawing={
        <>
          {[126, 1058].map((x) => (
            <rect
              key={x}
              x={x}
              y="610"
              width="16"
              height="940"
              rx="8"
              fill="#8B6BD8"
            />
          ))}
          <path
            d="M142 660 C 400 620, 800 700, 1058 660 L1058 1000 C 800 1040, 400 960, 142 1000 Z"
            fill={hasName ? LILAC : 'rgba(216,180,254,.14)'}
            stroke={LILAC}
            strokeWidth="5"
            strokeDasharray={hasName ? undefined : '22 16'}
          />
          <text
            x="600"
            y="836"
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="800"
            letterSpacing="-3"
            fontSize={fit(shown, 170, 880)}
            fill={hasName ? INK : LILAC}
          >
            {shown}
          </text>
        </>
      }
    />
  );
};

export const companyVisuals = [
  {
    id: 'stunt',
    title: '1. A stadium card stunt',
    note: 'A crowd of developers spells your name, and a wave sweeps through on every letter. Chosen, and in the flow. It wraps on whole words and shrinks for long names, up to 120 characters.',
  },
  {
    id: 'blocks',
    title: '2. The crew builds your name',
    note: 'A block drops in for every letter, and backspace takes it away. Playful, and it makes typing itself feel fun.',
  },
  {
    id: 'all-hands',
    title: '3. Your first all-hands',
    note: 'Closest to "your future squad": the team is already on the call with your company in their names.',
  },
  {
    id: 'teammate',
    title: '4. Your founding teammate',
    note: 'Your name picks a member of the crew, with a job title. Could stay on as the default avatar. Sometimes silly, by design.',
  },
  {
    id: 'terminal',
    title: "5. In a developer's terminal",
    note: 'The moment founders are selling toward, in a language they speak. The least decorated, and the most credible. The install command is only an illustration.',
  },
  {
    id: 'scroll',
    title: '6. The post that stops the scroll',
    note: 'The feed flies past until you type, then stops on your post. Says what the product does, with motion rather than words.',
  },
  {
    id: 'agent',
    title: '7. An agent recommends you',
    note: "The name streams into an agent's answer. The strongest promise, so it needs care: we can't promise this outcome.",
  },
  {
    id: 'brand',
    title: '8. A brand from your name',
    note: 'A colour and monogram worked out from the name, as Arc lets people pick a gradient early. Beautiful, but a placeholder brand may feel generic to a founder who has one.',
  },
  {
    id: 'real-page',
    title: '9. Your real page',
    note: 'The real company page, as Cal.com previews your booking page while you type. The most honest and common pattern, and the least surprising.',
  },
  {
    id: 'banner',
    title: '10. The crew holds your banner',
    note: 'From the last round, as a baseline. Simple, and the same art as sign-up.',
  },
];
