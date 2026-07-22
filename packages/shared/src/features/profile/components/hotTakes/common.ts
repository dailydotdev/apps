import { webappUrl } from '../../../../lib/constants';

export const HOT_TAKES_ANCHOR = 'hot-takes';
export const OPEN_ADD_HOT_TAKE_QUERY_PARAM = 'addHotTake';
export const OPEN_ADD_HOT_TAKE_QUERY_VALUE = '1';

export const getAddHotTakeProfileUrl = (username: string): string =>
  `${webappUrl}${username}?${OPEN_ADD_HOT_TAKE_QUERY_PARAM}=${OPEN_ADD_HOT_TAKE_QUERY_VALUE}#${HOT_TAKES_ANCHOR}`;

// View-only deep link (no `addHotTake` query, which would pop the add modal for
// owners): a shared link lands on the hot-takes section of the owner's profile.
export const getHotTakesProfileUrl = (username: string): string =>
  `${webappUrl}${username}#${HOT_TAKES_ANCHOR}`;

// Pre-filled share text quotes the take itself so the share reads like
// something a dev would post, not like a product template.
export const getHotTakeShareText = ({
  title,
  username,
}: {
  title: string;
  username?: string;
}): string =>
  username
    ? `Hot take: "${title}" — @${username} on daily.dev`
    : `Hot take: "${title}" — on daily.dev`;

export const isOpenAddHotTakeQuery = (
  value: string | string[] | undefined,
): boolean =>
  value === OPEN_ADD_HOT_TAKE_QUERY_VALUE ||
  (Array.isArray(value) && value.includes(OPEN_ADD_HOT_TAKE_QUERY_VALUE));
