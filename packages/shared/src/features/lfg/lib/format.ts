import { webappUrl } from '../../../lib/constants';

const DAY = 86_400_000;
const HOUR = 3_600_000;

export const getLfgUrl = (id?: string): string =>
  `${webappUrl}lfg${id ? `/${id}` : ''}`;

export const lfgNewPostUrl = `${webappUrl}lfg/new`;

export const getLfgEditUrl = (id: string): string =>
  `${webappUrl}lfg/${id}/edit`;

// A reach-out opens in the Requests tab of Messages.
export const getLfgReachOutUrl = (id?: string): string => {
  const params = new URLSearchParams({ tab: 'requests' });

  if (id) {
    params.set('reachOut', id);
  }

  return `${webappUrl}messages?${params.toString()}`;
};

// Board ages are in days: posts stay up a month, so hours add noise.
export const lfgRelativeDays = (value: string, now = new Date()): string => {
  const days = Math.floor((now.getTime() - new Date(value).getTime()) / DAY);

  if (days <= 0) {
    return 'today';
  }

  return days === 1 ? 'yesterday' : `${days}d ago`;
};

export const lfgDaysLeft = (expiresAt: string, now = new Date()): number =>
  Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / DAY));

export const formatLfgMemberSince = (value: string | Date): string =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

// Bare offsets everywhere: "UTC+1", "UTC+5:30", "UTC-3".
export const formatUtcOffset = (offset: number): string => {
  const hours = Math.trunc(Math.abs(offset));
  const minutes = Math.round((Math.abs(offset) - hours) * 60);

  return `UTC${offset < 0 ? '-' : '+'}${hours}${
    minutes ? `:${String(minutes).padStart(2, '0')}` : ''
  }`;
};

export const formatLfgReputation = (value: number): string =>
  `${value.toLocaleString('en-US')}+ reputation`;

// The reader's current offset, which leads the time zone pickers.
export const getLocalUtcOffset = (now = new Date()): number =>
  -now.getTimezoneOffset() / 60;

// The offset the API reads from the profile's time zone, which is what a post
// shows.
export const getUtcOffsetForTimeZone = (
  timeZone: string | undefined,
  now = new Date(),
): number => {
  if (!timeZone) {
    return getLocalUtcOffset(now);
  }

  try {
    const name = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    })
      .formatToParts(now)
      .find(({ type }) => type === 'timeZoneName')?.value;
    const match = name?.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);

    if (!match) {
      return 0;
    }

    const [, sign, hours, minutes = '0'] = match;

    return (sign === '-' ? -1 : 1) * (Number(hours) + Number(minutes) / 60);
  } catch {
    return getLocalUtcOffset(now);
  }
};

const clock = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
});

// Local time beats a bare offset when choosing who you'll talk to at night.
export const getUtcOffsetDetail = (
  offset: number,
  localOffset: number,
  now = new Date(),
): string => {
  const time = clock.format(new Date(now.getTime() + offset * HOUR));
  const gap = offset - localOffset;

  if (!gap) {
    return `${time} now · Your time zone`;
  }

  return `${time} now · ${Math.abs(gap)}h ${gap > 0 ? 'ahead' : 'behind'}`;
};

export const getFirstName = (name?: string | null): string =>
  name?.trim().split(/\s+/)[0] ?? '';
