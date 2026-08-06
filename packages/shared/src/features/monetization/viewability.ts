export interface ViewabilityCriteria {
  /** Share of the creative's pixels that must be inside the viewport. */
  ratio: number;
  /** Continuous milliseconds the ratio must hold. */
  duration: number;
}

/**
 * MRC/IAB viewable impression: 50% of the creative's pixels in the viewable
 * space of the browser for one continuous second. Creatives of 242,500 pixels
 * or more ("large display", e.g. a 970x250 billboard) only need 30%.
 */
export const displayCriteria: ViewabilityCriteria = {
  ratio: 0.5,
  duration: 1_000,
};

export const largeDisplayCriteria: ViewabilityCriteria = {
  ratio: 0.3,
  duration: 1_000,
};

export const largeDisplayArea = 242_500;

export const getViewabilityCriteria = (area: number): ViewabilityCriteria =>
  area >= largeDisplayArea ? largeDisplayCriteria : displayCriteria;

// Both criteria ratios plus the edges, so the observer reports every crossing
// of a ratio we care about.
export const viewabilityThresholds = [
  0,
  largeDisplayCriteria.ratio,
  displayCriteria.ratio,
  1,
];

/**
 * A threshold crossing can report a ratio a hair under the threshold that
 * triggered it, because the geometry is computed on fractional pixels. Without
 * the slack, an ad sitting exactly at 50% never counts.
 */
export const ratioTolerance = 0.001;

export interface ViewabilityData extends ViewabilityCriteria {
  /** Milliseconds between the creative rendering and meeting the criteria. */
  timeToViewable: number;
}

export const viewabilityLogExtra = ({
  ratio,
  duration,
  timeToViewable,
}: ViewabilityData): Record<string, unknown> => ({
  viewability_ratio: ratio,
  viewability_duration: duration,
  time_to_viewable: timeToViewable,
});
