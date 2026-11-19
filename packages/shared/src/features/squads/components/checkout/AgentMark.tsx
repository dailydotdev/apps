import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { AgentMarkData } from './agentMarks';

/** An agent's glyph on its brand tile. Decorative: the label owns the name. */
export const AgentMark = ({
  mark,
  className,
  glyphClassName,
}: {
  mark: AgentMarkData;
  /** The tile's size and radius. */
  className: string;
  /** The path glyph's size inside the tile; image glyphs fill it. */
  glyphClassName: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center overflow-hidden',
      className,
    )}
    style={{ background: mark.tile, color: mark.ink ?? '#fff' }}
  >
    {mark.glyph.kind === 'img' ? (
      <img src={mark.glyph.src} alt="" aria-hidden className="size-full" />
    ) : (
      <svg
        viewBox={mark.glyph.viewBox}
        className={glyphClassName}
        fill="currentColor"
        aria-hidden
      >
        {mark.glyph.paths.map((d) => (
          <path key={d} d={d} fillRule="evenodd" />
        ))}
      </svg>
    )}
  </span>
);
