import colors from '../../../styles/colors';

export const devCardBoxShadow = '1px 1px 1px rgb(0 0 0 /30%)';

export enum DevCardType {
  Vertical = 'vertical',
  Horizontal = 'horizontal',
  Compact = 'compact',
  Twitter = 'twitter',
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
  [DevCardTheme.Default]: `linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(152.83deg, #FFFFFF 51.92%, ${colors.salt['20']} 85.8%)`,
  [DevCardTheme.Iron]:
    `linear-gradient(135.48deg, ${colors.pepper['10']} 0%, ${colors.pepper['90']} 20%, ${colors.pepper['10']} 47.5%, #2C303A 67%, ${colors.pepper['90']} 83%, ${colors.pepper['10']} 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Bronze]:
    `linear-gradient(135.48deg, #C98463 0%, ${colors.burger['40']} 20%, #FFB760 47.5%, #C98463 67%, ${colors.burger['40']} 83%, #C98463 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Silver]:
    'linear-gradient(135.11deg, #A8B3CE 0%, #F6F8FC 18%, #CFD6E5 31.5%, #FFFFFF 49.19%, #CFD6E5 61.5%, #A8B3CE 78.5%, #CFD6E5 95.5%),\n' +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Gold]:
    `linear-gradient(135deg, ${colors.bun['10']} 0%, #FFF86E 27.5%, ${colors.bun['10']} 50%, #FFF86E 75%, ${colors.bun['10']} 100%),\n` +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Platinum]:
    'linear-gradient(135.18deg, #75F3BB 0%, #95EEF4 24.16%, #77A6F5 40%, #75F3BB 71.33%, #77A6F5 100%),\n' +
    `linear-gradient(180deg, ${colors.salt['20']} 0%, ${colors.salt['10']} 85.42%)`,
  [DevCardTheme.Diamond]:
    'linear-gradient(135.18deg, #E769FB 0%, #9E70F8 24.16%, #68A6FD 40%, #9E70F8 71.33%, #D473F4 100%),\n' +
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
