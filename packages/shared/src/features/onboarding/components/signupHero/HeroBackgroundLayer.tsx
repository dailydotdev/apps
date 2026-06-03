import type { ReactElement } from 'react';
import React from 'react';
import type {
  FunnelSignupHeroBackground,
  FunnelSignupHeroImageMode,
} from '../../types/funnel';
import { CardsBackground } from './CardsBackground';
import { DeskBackground } from './DeskBackground';

// =============================================================
// Background layer — renders the selected background's artwork.
// In 'colors' image mode the artwork is omitted, leaving just the
// gradient backdrop.
// =============================================================

type HeroBackgroundLayerProps = {
  background: FunnelSignupHeroBackground;
  imageMode: FunnelSignupHeroImageMode;
};

export const HeroBackgroundLayer = ({
  background,
  imageMode,
}: HeroBackgroundLayerProps): ReactElement | null => {
  if (imageMode === 'colors') {
    return null;
  }

  return background === 'desk' ? (
    <DeskBackground />
  ) : (
    <CardsBackground splitMode={background === 'split'} />
  );
};
