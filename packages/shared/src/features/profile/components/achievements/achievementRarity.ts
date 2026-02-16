export enum AchievementRarityTier {
  Emerald = 'emerald',
  Gold = 'gold',
  Silver = 'silver',
  Bronze = 'bronze',
}

export const getAchievementRarityTier = (
  rarity: number | null | undefined,
): AchievementRarityTier | null => {
  if (rarity == null) {
    return null;
  }
  if (rarity <= 1) {
    return AchievementRarityTier.Emerald;
  }
  if (rarity <= 5) {
    return AchievementRarityTier.Gold;
  }
  if (rarity <= 10) {
    return AchievementRarityTier.Silver;
  }
  if (rarity <= 15) {
    return AchievementRarityTier.Bronze;
  }
  return null;
};

export const rarityColors: Record<AchievementRarityTier, string> = {
  [AchievementRarityTier.Emerald]: '52,255,128',
  [AchievementRarityTier.Gold]: '255,215,0',
  [AchievementRarityTier.Silver]: '190,210,255',
  [AchievementRarityTier.Bronze]: '235,140,60',
};

export const rarityGlowClasses: Record<AchievementRarityTier, string> = {
  [AchievementRarityTier.Emerald]:
    'shadow-[0_0_8px_1px_rgba(52,255,128,0.5)] border-[rgba(52,255,128,0.7)]',
  [AchievementRarityTier.Gold]:
    'shadow-[0_0_8px_1px_rgba(255,215,0,0.55)] border-[rgba(255,215,0,0.75)]',
  [AchievementRarityTier.Silver]:
    'shadow-[0_0_8px_1px_rgba(190,210,255,0.5)] border-[rgba(190,210,255,0.7)]',
  [AchievementRarityTier.Bronze]:
    'shadow-[0_0_8px_1px_rgba(235,140,60,0.5)] border-[rgba(235,140,60,0.7)]',
};
