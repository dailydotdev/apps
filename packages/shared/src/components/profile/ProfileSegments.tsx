import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { withoutLayoutVariantPrefix } from '../../lib/layoutVariant';
import type { RowItem } from '../shell/ShellRow';
import { Segments, ShellRow } from '../shell/ShellRow';

export enum ProfileSegment {
  About = 'About',
  Posts = 'Posts',
  Replies = 'Replies',
  Upvoted = 'Upvoted',
}

const paths: Record<ProfileSegment, string> = {
  [ProfileSegment.About]: '',
  [ProfileSegment.Posts]: '/posts',
  [ProfileSegment.Replies]: '/replies',
  [ProfileSegment.Upvoted]: '/upvoted',
};

const segmentPath = /\/(posts|replies|upvoted)$/;

// The segment an address names: the profile's own address is About, and
// each other segment is a path under it.
export const getProfileSegment = (
  asPath: string,
): ProfileSegment | undefined => {
  const path = withoutLayoutVariantPrefix(asPath.split(/[?#]/)[0]).replace(
    /\/$/,
    '',
  );
  const match = path.match(/^\/[^/]+(\/[^/]+)?$/);
  if (!match) {
    return undefined;
  }
  const suffix = match[1] ?? '';

  return Object.values(ProfileSegment).find(
    (segment) => paths[segment] === suffix,
  );
};

interface ProfileSegmentState {
  segment: ProfileSegment;
  setSegment: (segment: ProfileSegment) => void;
}

// Every segment keeps its own address, so a reload and a shared link land
// on it, but a switch is a view of the page the reader is on: the page
// stays mounted (the address is masked over the current route, shallow),
// the entry is replaced and the scroll is left alone. `fallback` is the
// segment of the route itself, for before the router has the address.
export const useProfileSegment = (
  fallback: ProfileSegment,
): ProfileSegmentState => {
  const router = useRouter();
  const segment = getProfileSegment(router?.asPath ?? '') ?? fallback;

  const setSegment = useCallback(
    (next: ProfileSegment) => {
      const [path, search = ''] = router.asPath.split('#')[0].split('?');
      const base = path.replace(/\/$/, '').replace(segmentPath, '');
      const as = `${base}${paths[next]}${search ? `?${search}` : ''}`;

      router.replace({ pathname: router.pathname, query: router.query }, as, {
        shallow: true,
        scroll: false,
      });
    },
    [router],
  );

  return { segment, setSegment };
};

// A profile's views on a phone.
export function ProfileSegments({
  active,
  onSelect,
}: {
  active: ProfileSegment;
  onSelect: (segment: ProfileSegment) => void;
}): ReactElement {
  const items: RowItem[] = Object.values(ProfileSegment).map((segment) => ({
    key: segment,
    label: segment,
    active: segment === active,
    onClick: () => onSelect(segment),
  }));

  return (
    <ShellRow>
      <Segments items={items} />
    </ShellRow>
  );
}
