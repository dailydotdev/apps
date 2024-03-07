import { getRandomNumber } from './func';

const friday = [
  { min: 6146, max: 6817 },
  { min: 6493, max: 8839 },
  { min: 8733, max: 10437 },
  { min: 10221, max: 10965 },
  { min: 10703, max: 10977 },
  { min: 9929, max: 10843 },
  { min: 10619, max: 15122 },
  { min: 15002, max: 18105 },
  { min: 17896, max: 21587 },
  { min: 21079, max: 22576 },
  { min: 20440, max: 22406 },
  { min: 18247, max: 20626 },
  { min: 18189, max: 19681 },
  { min: 19348, max: 21484 },
  { min: 20811, max: 21636 },
  { min: 18621, max: 21307 },
  { min: 16478, max: 19051 },
  { min: 14157, max: 16518 },
  { min: 12293, max: 14157 },
  { min: 11208, max: 12455 },
  { min: 10011, max: 11257 },
  { min: 8482, max: 9995 },
  { min: 6851, max: 8423 },
  { min: 5488, max: 6822 },
];

const weekday = [
  { min: 5485, max: 7123 },
  { min: 6197, max: 9547 },
  { min: 8792, max: 11236 },
  { min: 10351, max: 11593 },
  { min: 10681, max: 12160 },
  { min: 10801, max: 12266 },
  { min: 11786, max: 17043 },
  { min: 16504, max: 20868 },
  { min: 20107, max: 24703 },
  { min: 10157, max: 25446 },
  { min: 22665, max: 25402 },
  { min: 19840, max: 23682 },
  { min: 20037, max: 22782 },
  { min: 21641, max: 24637 },
  { min: 23436, max: 25142 },
  { min: 21295, max: 25231 },
  { min: 18676, max: 24801 },
  { min: 15519, max: 20066 },
  { min: 13813, max: 16327 },
  { min: 12711, max: 14565 },
  { min: 11552, max: 13514 },
  { min: 9802, max: 12151 },
  { min: 8030, max: 10297 },
  { min: 6554, max: 8426 },
];

const weekend = [
  { min: 4317, max: 5555 },
  { min: 4326, max: 5160 },
  { min: 4482, max: 5580 },
  { min: 4965, max: 5901 },
  { min: 5345, max: 6107 },
  { min: 5693, max: 6343 },
  { min: 6058, max: 7119 },
  { min: 6770, max: 7577 },
  { min: 7496, max: 8839 },
  { min: 8287, max: 9285 },
  { min: 8801, max: 9476 },
  { min: 8949, max: 9786 },
  { min: 9142, max: 10313 },
  { min: 9694, max: 11447 },
  { min: 10453, max: 11885 },
  { min: 11025, max: 12243 },
  { min: 10534, max: 12100 },
  { min: 9745, max: 11256 },
  { min: 8661, max: 10527 },
  { min: 8027, max: 9605 },
  { min: 7214, max: 9058 },
  { min: 6456, max: 8360 },
  { min: 5669, max: 7312 },
  { min: 4832, max: 6372 },
];

export const activeUsers = { friday, weekend, weekday };

const getDayCategory = (day: number) => {
  if (day === 6 || day === 0) {
    return 'weekend';
  }

  return day === 5 ? 'friday' : 'weekday';
};

export const getRandomUsersCount = (): number => {
  const now = new Date();
  const category = getDayCategory(now.getDay());
  const hour = now.getHours();
  const activity = activeUsers[category][hour];

  return getRandomNumber(activity.min, activity.max);
};
