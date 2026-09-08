import React from 'react';
import {
  Card,
  CardTitle,
} from '@dailydotdev/shared/src/components/cards/common/Card';
import { Header } from '@dailydotdev/shared/src/components/marketing/cta/common';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  PreferGoogleButton,
  SearchPreview,
} from '@dailydotdev/shared/src/components/post/preferredSources';

export type PreferredSearchCardProps = {
  onDismiss?: () => void;
  onAdd?: () => void;
};

/**
 * The empty-ad-slot card with its gate removed, so the story can render it
 * without a live feature flag.
 *
 * Only the wrapper is duplicated — `SearchPreview` is imported from the real
 * component. It used to be copied here, and the copy drifted: the product one
 * moved to a light Google palette and the real favicon while this still drew
 * the old themed version, so the review image showed something that does not
 * ship.
 */
export const PreferredSearchCard = ({
  onDismiss,
  onAdd,
}: PreferredSearchCardProps): React.ReactElement => (
  <Card className="p-4">
    <Header tagColor="cabbage" tagText="Google" onClose={onDismiss} />
    <CardTitle className="typo-title3">
      See daily.dev in your Google results
    </CardTitle>
    <SearchPreview className="my-3" />
    <PreferGoogleButton
      className="mt-auto w-full"
      label="Add as preferred source"
      onAdd={onAdd}
      size={ButtonSize.Small}
      variant={ButtonVariant.Primary}
    />
  </Card>
);
