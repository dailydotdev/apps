import { useEffect, useState } from 'react';
import type { Feature } from '../../lib/featureManagement';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { isPreviewHost } from '../../lib/constants';

/**
 * A share placement is on when its flag says so — or unconditionally on a
 * branch preview deployment, which is the only way to review one: previews run
 * as production against the production API, so there is no dev mode and no
 * GrowthBook tooling to open the flag from the browser.
 *
 * The flag default stays false, so merging changes nothing for anyone on
 * app.daily.dev; the rollout is still a GrowthBook decision.
 */
export function useSharePlacement({
  feature,
  shouldEvaluate,
}: {
  feature: Feature<boolean>;
  shouldEvaluate?: boolean;
}): boolean {
  const { value } = useConditionalFeature({ feature, shouldEvaluate });
  // After mount, not during render: the server cannot know the host the page
  // will be served from, and disagreeing with it would break hydration.
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setIsPreview(isPreviewHost());
  }, []);

  return value || (isPreview && shouldEvaluate !== false);
}
