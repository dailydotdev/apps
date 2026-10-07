import type { CSSProperties, ReactElement } from 'react';
import React from 'react';

/**
 * Faces for the frames.
 *
 * A stat card is a chart. A stat card with faces on it is a post about people,
 * and that is the difference between something that gets looked at and
 * something that gets shared. Every frame that can carry a face carries one.
 *
 * These are real, public developers, pulled from `github.com/<login>.png` —
 * a stable, unauthenticated, hotlink-friendly endpoint, and the closest public
 * stand-in for daily.dev's population. The numbers attached to them are
 * invented, so none of these previews should leave an internal review as-is.
 */

export interface Person {
  login: string;
  name: string;
  handle: string;
}

export const ME: Person = {
  login: 'tsahimatsliah',
  name: 'Maya Chen',
  handle: '@mayabuilds',
};

export const CAST: Person[] = [
  { login: 'kelseyhightower', name: 'Kelsey H.', handle: '@kelseyh' },
  { login: 'sindresorhus', name: 'Sindre S.', handle: '@sindre' },
  { login: 'lydiahallie', name: 'Lydia H.', handle: '@lydia' },
  { login: 'mitchellh', name: 'Mitchell H.', handle: '@mitchellh' },
  { login: 'jessfraz', name: 'Jess F.', handle: '@jessfraz' },
  { login: 'simonw', name: 'Simon W.', handle: '@simonw' },
  { login: 'cassidoo', name: 'Cassidy W.', handle: '@cassidoo' },
  { login: 'ThePrimeagen', name: 'Prime', handle: '@theprimeagen' },
  { login: 'antirez', name: 'Salvatore S.', handle: '@antirez' },
  { login: 'karpathy', name: 'Andrej K.', handle: '@karpathy' },
  { login: 'ashleymcnamara', name: 'Ashley M.', handle: '@ashley' },
  { login: 'bradfitz', name: 'Brad F.', handle: '@bradfitz' },
];

export const personBy = (login: string): Person =>
  CAST.find((person) => person.login === login) ?? ME;

const avatarUrl = (login: string, size: number): string =>
  `https://github.com/${login}.png?size=${Math.max(64, Math.round(size * 2))}`;

/** For places that need the raw URL, like the badge medal's image pattern. */
export const avatarFor = (person: Person, size = 256): string =>
  avatarUrl(person.login, size / 2);

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

/**
 * The initials sit underneath as the fallback, so a blocked or slow avatar
 * still reads as a person rather than an empty circle.
 */
export const Avatar = ({
  person,
  size = 48,
  ring,
  dim = 1,
  style,
}: {
  person: Person;
  size?: number;
  ring?: string;
  dim?: number;
  style?: CSSProperties;
}): ReactElement => (
  <div
    title={person.name}
    style={{
      position: 'relative',
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: '50%',
      overflow: 'hidden',
      background: 'linear-gradient(145deg, #887BF8 0%, #CE3DF3 100%)',
      color: 'rgba(12,14,19,0.78)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: Math.max(8, size * 0.36),
      opacity: dim,
      boxShadow: ring
        ? `0 0 0 ${Math.max(2, size * 0.055)}px ${ring}`
        : undefined,
      userSelect: 'none',
      ...style,
    }}
  >
    {initialsOf(person.name)}
    <img
      src={avatarUrl(person.login, size)}
      alt=""
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  </div>
);

/** Overlapping faces, with an optional overflow counter. */
export const AvatarStack = ({
  people,
  size = 40,
  ring = '#0C0E13',
  more,
}: {
  people: Person[];
  size?: number;
  ring?: string;
  more?: number;
}): ReactElement => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {people.map((person, index) => (
      <Avatar
        key={person.login}
        person={person}
        size={size}
        ring={ring}
        style={{ marginLeft: index === 0 ? 0 : -size * 0.3 }}
      />
    ))}
    {more ? (
      <span
        style={{
          marginLeft: -size * 0.3,
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          boxShadow: `0 0 0 ${Math.max(2, size * 0.055)}px ${ring}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.32,
          fontWeight: 700,
          color: 'rgba(246,247,249,0.75)',
        }}
      >
        +{more}
      </span>
    ) : null}
  </div>
);
