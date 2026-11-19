import type { ReactElement } from 'react';
import React from 'react';
import { StartupsCrewOnBase, startupsPlazaSky } from './StartupsCrewOnBase';

// The company step's right side: a stadium of seats spells the name as it's typed.

const MOTION = `
@keyframes startupsFlip { from { opacity: 0; transform: scaleY(0); } to { opacity: 1; transform: none; } }
.startups-seat { transform-box: fill-box; transform-origin: center; animation: startupsFlip .25s cubic-bezier(.23,1,.32,1) both; }
@media (prefers-reduced-motion: reduce) { .startups-seat { animation: none !important; } }
`;

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

export const StartupsNameStunt = ({ name }: { name: string }): ReactElement => {
  const hasName = !!name.trim();
  const lines = layOutStunt(normalize(name) || 'YOUR COMPANY');
  const { columns, rows } = toSeats(lines);
  const patternId = `startups-seats-${columns}-${rows}`;

  return (
    <div
      aria-hidden
      className="relative h-full w-full overflow-hidden"
      style={{ background: startupsPlazaSky, color: '#fff' }}
    >
      <style dangerouslySetInnerHTML={{ __html: MOTION }} />
      <StartupsCrewOnBase />
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
                          fill="#D8B4FE"
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
    </div>
  );
};
