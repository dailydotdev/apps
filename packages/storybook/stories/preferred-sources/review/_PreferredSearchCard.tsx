import React from 'react';
import classNames from 'classnames';
import {
  Card,
  CardTitle,
} from '@dailydotdev/shared/src/components/cards/common/Card';
import { Header } from '@dailydotdev/shared/src/components/marketing/cta/common';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { GoogleIcon } from '@dailydotdev/shared/src/components/icons';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import { PreferGoogleButton } from '@dailydotdev/shared/src/components/post/preferredSources';

/**
 * A feed-card-sized glimpse of a Google results page with daily.dev marked
 * Preferred. No search-bar pill: a small G on the corner, the query as plain
 * text, then the result. Drawn in CSS so it needs no asset and follows the
 * theme. The G mark is Google's own, unmodified.
 */
export const SearchPreview = ({
  className,
  query = 'cursor agent mode review',
}: {
  className?: string;
  query?: string;
}): React.ReactElement => (
  <div
    className={classNames(
      'relative overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle',
      className,
    )}
    aria-hidden
  >
    <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-3 py-2">
      <GoogleIcon secondary className="size-4 shrink-0" />
      <span className="truncate text-text-secondary typo-footnote">
        {query}
      </span>
    </div>
    <div className="flex flex-col gap-1.5 px-3 pb-3 pt-2.5">
      <div className="flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-6 bg-background-default">
          <LogoIcon className={{ container: 'size-3' }} />
        </span>
        <span className="text-text-primary typo-caption1">daily.dev</span>
        <span className="rounded-6 bg-action-upvote-float px-1.5 py-0.5 font-bold text-action-upvote-default typo-caption2">
          Preferred
        </span>
      </div>
      <span className="text-text-link typo-callout">
        Cursor agent mode: three weeks in production
      </span>
      <span className="h-1.5 w-11/12 rounded-4 bg-surface-float" />
      <span className="h-1.5 w-2/3 rounded-4 bg-surface-float" />
      <div className="mt-2 flex flex-col gap-1.5 opacity-40">
        <span className="h-1.5 w-1/3 rounded-4 bg-surface-float" />
        <span className="h-1.5 w-10/12 rounded-4 bg-surface-float" />
      </div>
    </div>
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-background-subtle to-transparent" />
  </div>
);

export type PreferredSearchCardProps = {
  onDismiss?: () => void;
  onAdd?: () => void;
};

/** The empty-ad-slot card: the preview above, one line, one primary button. */
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
