import { webappUrl } from '../../../../lib/constants';

export const HOT_TAKES_ANCHOR = 'hot-takes';
export const OPEN_ADD_HOT_TAKE_QUERY_PARAM = 'addHotTake';
export const OPEN_ADD_HOT_TAKE_QUERY_VALUE = '1';

export const getAddHotTakeProfileUrl = (username: string): string =>
  `${webappUrl}${username}?${OPEN_ADD_HOT_TAKE_QUERY_PARAM}=${OPEN_ADD_HOT_TAKE_QUERY_VALUE}#${HOT_TAKES_ANCHOR}`;

export const isOpenAddHotTakeQuery = (
  value: string | string[] | undefined,
): boolean =>
  value === OPEN_ADD_HOT_TAKE_QUERY_VALUE ||
  (Array.isArray(value) && value.includes(OPEN_ADD_HOT_TAKE_QUERY_VALUE));
