import colors from '../../../styles/colors';
import classed from '../../../lib/classed';

export const RoundedContainer = classed('div', 'rounded-32');
export const devCardBoxShadow = '1px 1px 1px rgb(0 0 0 /30%)';

export enum DevCardType {
  Vertical = 'DEFAULT',
  Horizontal = 'WIDE',
  Compact = 'COMPACT',
  Twitter = 'X',
}

export enum DevCardTheme {
  Default = 'default',
  Iron = 'iron',
  Bronze = 'bronze',
  Silver = 'silver',
  Gold = 'gold',
  Platinum = 'platinum',
  Diamond = 'diamond',
  Legendary = 'legendary',
}

export const themeToLinearGradient = {
  [DevCardTheme.Default]: `linear-gradient(0deg, ${colors.salt['0']}, ${colors.salt['0']}), linear-gradient(152.83deg, ${colors.salt['0']} 51.92%, ${colors.salt['20']} 85.8%)`,
  [DevCardTheme.Iron]:
    `linear-gradient(135.48deg, ${colors.pepper['10']} 0%, ${colors.pepper['90']} 20%, ${colors.pepper['10']} 47.5%, ${colors.pepper['50']} 67%, ${colors.pepper['90']} 83%, ${colors.pepper['10']} 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Bronze]:
    `linear-gradient(135.48deg, ${colors.burger['10']} 0%, ${colors.burger['40']} 20%, ${colors.bun['10']} 47.5%, ${colors.burger['10']} 67%, ${colors.burger['40']} 83%, ${colors.burger['10']} 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Silver]:
    `linear-gradient(135.11deg, ${colors.salt['90']} 0%, ${colors.salt['10']} 18%, ${colors.salt['50']} 31.5%, ${colors.salt['0']} 49.19%, ${colors.salt['50']} 61.5%, ${colors.salt['90']} 78.5%, ${colors.salt['50']} 95.5%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Gold]:
    `linear-gradient(135deg, ${colors.bun['10']} 0%, ${colors.cheese['10']} 27.5%, ${colors.bun['10']} 50%, ${colors.cheese['10']} 75%, ${colors.bun['10']} 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Platinum]:
    `linear-gradient(135.18deg, ${colors.avocado['10']} 0%, ${colors.blueCheese['10']} 24.16%, ${colors.water['10']} 40%, ${colors.avocado['10']} 71.33%, ${colors.water['10']} 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Diamond]:
    `linear-gradient(135.18deg, ${colors.cabbage['10']} 0%, ${colors.onion['10']} 24.16%, ${colors.water['10']} 40%, ${colors.onion['10']} 71.33%, ${colors.cabbage['10']} 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Legendary]:
    `linear-gradient(135.18deg, ${colors.ketchup['10']} 0%, ${colors.bacon['10']} 24.16%, ${colors.bun['10']} 40%, ${colors.bacon['10']} 71.33%, ${colors.ketchup['10']} 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
};

export const requiredPoints: Record<DevCardTheme, number> = {
  [DevCardTheme.Default]: 10,
  [DevCardTheme.Iron]: 20,
  [DevCardTheme.Bronze]: 50,
  [DevCardTheme.Silver]: 100,
  [DevCardTheme.Gold]: 500,
  [DevCardTheme.Platinum]: 1000,
  [DevCardTheme.Diamond]: 5000,
  [DevCardTheme.Legendary]: 10000,
};

export const devcardTypeToEventFormat = {
  [DevCardType.Vertical]: 'vertical',
  [DevCardType.Horizontal]: 'horizontal',
  [DevCardType.Twitter]: 'x',
};
