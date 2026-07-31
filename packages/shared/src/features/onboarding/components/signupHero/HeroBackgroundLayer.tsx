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
//
// The cards and split backgrounds are always the live feed-cards
// mosaic. `imageMode` only applies to the desk background (the only
// one with an actual photo): 'colors' omits the photo, leaving just
// the gradient backdrop.
// =============================================================

type HeroBackgroundLayerProps = {
  background: FunnelSignupHeroBackground;
  imageMode: FunnelSignupHeroImageMode;
};

export const HeroBackgroundLayer = ({
  background,
  imageMode,
}: HeroBackgroundLayerProps): ReactElement | null => {
  if (background === 'desk') {
    return imageMode === 'colors' ? null : <DeskBackground />;
  }

  // The panel owns its artwork inside the layout (the split's second column),
  // so there is nothing to render here.
  if (background === 'panel') {
    return null;
  }

  return <CardsBackground splitMode={background === 'split'} />;
};
