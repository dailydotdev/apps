import { StreakTier } from '../../../../lib/streakMilestones';
import BlazeImage from './blaze.png';
import EmberImage from './ember.png';
import EternalFlameImage from './eternal-flame.png';
import FirestormImage from './firestorm.png';
import FlameImage from './flame.png';
import GodflameImage from './godflame.png';
import InfernoImage from './inferno.png';
import KindleImage from './kindle.png';
import LegendaryImage from './legendary.png';
import PhoenixImage from './phoenix.png';
import ScorcherImage from './scorcher.png';
import SparkImage from './spark.png';
import SupernovaImage from './supernova.png';
import TitanImage from './titan.png';

const getAssetSrc = (asset: string | { src?: string }): string =>
  typeof asset === 'string' ? asset : asset.src || '';

export const MILESTONE_ICON_URLS: Record<StreakTier, string> = {
  [StreakTier.Ember]: getAssetSrc(EmberImage),
  [StreakTier.Spark]: getAssetSrc(SparkImage),
  [StreakTier.Kindle]: getAssetSrc(KindleImage),
  [StreakTier.Flame]: getAssetSrc(FlameImage),
  [StreakTier.Blaze]: getAssetSrc(BlazeImage),
  [StreakTier.Firestorm]: getAssetSrc(FirestormImage),
  [StreakTier.Inferno]: getAssetSrc(InfernoImage),
  [StreakTier.Scorcher]: getAssetSrc(ScorcherImage),
  [StreakTier.EternalFlame]: getAssetSrc(EternalFlameImage),
  [StreakTier.Supernova]: getAssetSrc(SupernovaImage),
  [StreakTier.Legendary]: getAssetSrc(LegendaryImage),
  [StreakTier.Phoenix]: getAssetSrc(PhoenixImage),
  [StreakTier.Titan]: getAssetSrc(TitanImage),
  [StreakTier.Godflame]: getAssetSrc(GodflameImage),
};
