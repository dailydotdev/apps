import { formatHour } from '../FeedPatchy/ReminderPicker';

// Where clocks read "5:00 PM": the US, Canada, Australia, New Zealand,
// India, Pakistan and the Philippines. Everywhere else reads "17:00".
const TWELVE_HOUR_ZONE_PREFIXES = [
  'US/',
  'Canada/',
  'Australia/',
  'America/Indiana/',
  'America/Kentucky/',
  'America/North_Dakota/',
];

const TWELVE_HOUR_ZONES = new Set([
  'America/New_York',
  'America/Detroit',
  'America/Chicago',
  'America/Menominee',
  'America/Denver',
  'America/Boise',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Juneau',
  'America/Sitka',
  'America/Metlakatla',
  'America/Yakutat',
  'America/Nome',
  'America/Adak',
  'Pacific/Honolulu',
  'America/St_Johns',
  'America/Halifax',
  'America/Glace_Bay',
  'America/Moncton',
  'America/Goose_Bay',
  'America/Toronto',
  'America/Winnipeg',
  'America/Regina',
  'America/Swift_Current',
  'America/Edmonton',
  'America/Vancouver',
  'America/Whitehorse',
  'America/Dawson',
  'America/Yellowknife',
  'America/Iqaluit',
  'Pacific/Auckland',
  'Pacific/Chatham',
  'Asia/Kolkata',
  'Asia/Calcutta',
  'Asia/Karachi',
  'Asia/Manila',
]);

/** Whether clocks in this time zone read "5:00 PM" rather than "17:00". */
export const isTwelveHourZone = (timezone: string): boolean =>
  TWELVE_HOUR_ZONES.has(timezone) ||
  TWELVE_HOUR_ZONE_PREFIXES.some((prefix) => timezone.startsWith(prefix));

/** A device clock for the hour, with its AM/PM apart so it can sit smaller. */
export const clockOfHour = (
  hour: number,
  isTwelveHour: boolean,
): { clock: string; period?: string } => {
  const [clock, period] = formatHour(hour, isTwelveHour).split(' ');
  return { clock, period };
};
