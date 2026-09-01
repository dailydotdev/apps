import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';

const MUTED = colors.salt['90'];
const TRACK = colors.pepper['10'];

/** The question carries the card, so it takes what room the options leave. */
const questionFontSize = (length: number): number => {
  if (length <= 40) {
    return 56;
  }

  if (length <= 70) {
    return 46;
  }

  return 38;
};

export interface PollSnapshotOption {
  text: string;
  /** Whole percent. The card renders what it is given rather than recomputing. */
  share: number;
}

export interface PollSnapshotCardProps {
  question: string;
  options: PollSnapshotOption[];
  /** Status, vote count and date — the line the poll carries in the product. */
  meta?: string[];
  source?: { name: string };
  seed?: string;
}

function PollSnapshotCardComponent(
  { question, options, meta, source, seed }: PollSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  // A closed poll is a result, and the result is the winner: it is drawn in
  // the accent while the rest stay quiet, so the answer reads before the bars.
  const leader = Math.max(...options.map((option) => option.share));

  return (
    <SnapshotFrame ref={ref} seed={seed ?? question}>
      <div className="flex flex-1 flex-col">
        <span
          className="font-bold uppercase"
          style={{
            color: colors.cabbage['10'],
            fontSize: 22,
            letterSpacing: 2,
          }}
        >
          Poll
        </span>

        <h1
          className="snapshot-copy mt-4 font-bold text-white"
          style={{
            fontSize: questionFontSize(question.length),
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}
        >
          {question}
        </h1>

        {!!meta?.length && (
          <span
            className="mt-4 truncate"
            style={{ color: MUTED, fontSize: 26 }}
          >
            {meta.join(' · ')}
          </span>
        )}

        <ol className="mt-8 flex flex-1 flex-col justify-center gap-5">
          {options.slice(0, 4).map((option) => (
            <li
              key={option.text}
              className="relative flex items-center overflow-hidden"
              style={{
                height: 84,
                borderRadius: 20,
                background: TRACK,
              }}
            >
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${option.share}%`,
                  borderRadius: 20,
                  background:
                    option.share === leader
                      ? colors.cabbage['40']
                      : colors.pepper['40'],
                }}
              />
              <span
                className="relative flex-1 truncate font-bold text-white"
                style={{ fontSize: 30, paddingLeft: 28, paddingRight: 16 }}
              >
                {option.text}
              </span>
              <span
                className="relative font-bold text-white"
                style={{ fontSize: 30, paddingRight: 28 }}
              >
                {option.share}%
              </span>
            </li>
          ))}
        </ol>

        {source && (
          <span
            className="mt-8 truncate font-bold text-white"
            style={{ fontSize: 28 }}
          >
            {source.name}
          </span>
        )}
      </div>
    </SnapshotFrame>
  );
}

export const PollSnapshotCard = forwardRef(PollSnapshotCardComponent);
