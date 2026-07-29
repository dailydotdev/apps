import type { ComponentType, ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { PopoverContent } from '../../../components/popover/Popover';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { AppleIcon, PhoneIcon } from '../../../components/icons';
import { GooglePlayIcon } from '../../../components/icons/GooglePlay';
import type { IconProps } from '../../../components/Icon';
import { IconSize } from '../../../components/Icon';
import { useViewSize, ViewSize } from '../../../hooks';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import usePersistentContext from '../../../hooks/usePersistentContext';
import { featureHeaderGetApp } from '../../../lib/featureManagement';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { isIOSNative } from '../../../lib/func';
import { appStoreUrl, playStoreUrl } from '../../../lib/constants';
import { GetAppQrCode } from './GetAppQrCode';

interface AppStore {
  id: string;
  label: string;
  href: string;
  Icon: ComponentType<IconProps>;
  // Optically balanced, not equal: the Apple glyph sits inside its viewBox at
  // roughly 67% width, while the Play mark runs nearly edge to edge. Rendering
  // both at one size makes Apple look shrunken, so Apple gets the larger box.
  iconSize: IconSize;
}

const stores: AppStore[] = [
  {
    id: 'ios',
    label: 'App Store',
    href: appStoreUrl,
    Icon: AppleIcon,
    iconSize: IconSize.XSmall,
  },
  {
    id: 'android',
    label: 'Google Play',
    href: playStoreUrl,
    Icon: GooglePlayIcon,
    iconSize: IconSize.Size16,
  },
];

// One-time attention dot. The button is a permanent affordance, not a campaign,
// so it nudges once and then goes quiet - a banner that keeps reappearing is
// what we're deliberately not building here.
const GET_APP_SEEN_KEY = 'getAppHeaderSeen';

export interface GetAppButtonProps {
  // The logged-out header has room for the full label; the logged-in action
  // rail (opportunity, quests, giveback, bell, avatar) does not, so it gets the
  // icon-only trigger with the label in a tooltip.
  showLabel?: boolean;
  className?: string;
  // Escape hatch for surfaces that already resolved `featureHeaderGetApp` (and
  // for Storybook, which has no GrowthBook instance). Left undefined, the
  // button evaluates the flag itself.
  isFeatureEnabled?: boolean;
}

export function GetAppButton({
  showLabel = false,
  className,
  isFeatureEnabled: isFeatureEnabledProp,
}: GetAppButtonProps): ReactElement | null {
  const [isOpen, setIsOpen] = useState(false);
  const { logEvent } = useLogContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  // The point of this entry point is telling *desktop* visitors that a mobile
  // app exists. Below laptop we're either on mobile web or inside the native
  // wrapper - which renders this same webapp shell - and neither should be
  // told to go get an app they're already holding.
  const shouldRender = isLaptop && !isIOSNative();
  const { value: isFlagEnabled } = useConditionalFeature({
    feature: featureHeaderGetApp,
    shouldEvaluate: shouldRender && isFeatureEnabledProp === undefined,
  });
  const isFeatureEnabled = isFeatureEnabledProp ?? isFlagEnabled;
  const [hasSeen, setHasSeen, isSeenFetched] = usePersistentContext<boolean>(
    GET_APP_SEEN_KEY,
    false,
  );

  const onOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);

      if (!open) {
        return;
      }

      setHasSeen(true);
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.GetAppButton,
      });
    },
    [logEvent, setHasSeen],
  );

  const onStoreClick = useCallback(
    (store: AppStore) => {
      logEvent({
        event_name: LogEvent.DownloadApp,
        target_type: TargetType.GetAppButton,
        target_id: store.id,
      });
    },
    [logEvent],
  );

  if (!shouldRender || !isFeatureEnabled) {
    return null;
  }

  const showDot = !showLabel && isSeenFetched && !hasSeen;

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      {/* The dot is a sibling of the Button, not a child: Button derives its
          icon-only geometry from `!children`, so nesting the dot inside would
          switch it to the labelled layout (`pl-2 pr-4 gap-1`) and push the
          glyph 4px off centre. */}
      <span className={classNames('relative inline-flex', className)}>
        <Tooltip
          content="Get the mobile app"
          side="bottom"
          visible={!showLabel}
        >
          <PopoverTrigger asChild>
            <Button
              variant={ButtonVariant.Float}
              size={showLabel ? ButtonSize.Medium : undefined}
              className={classNames('justify-center', !showLabel && 'w-10')}
              icon={<PhoneIcon secondary={isOpen} />}
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              aria-label="Get the daily.dev mobile app"
            >
              {showLabel ? 'Get the app' : null}
            </Button>
          </PopoverTrigger>
        </Tooltip>
        {showDot && (
          <span
            aria-hidden
            className="pointer-events-none absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background-default bg-accent-cabbage-default"
          />
        )}
      </span>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="z-popup w-96 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4"
      >
        <div className="flex gap-4">
          {/* Level H is a denser matrix than the plain code was, so it gets a
              bigger plate to keep the modules comfortably scannable. */}
          <GetAppQrCode className="size-32 shrink-0" />
          {/* The global reset pins `flex-shrink: 0`, so the copy needs both
              `flex-1` and `min-w-0` or it blows past the panel instead of
              wrapping. */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <p className="font-bold text-text-primary typo-callout">
              daily.dev on your phone
            </p>
            <p className="text-text-tertiary typo-footnote">
              Scan the code with your camera. Your feed, bookmarks and streak
              come with you.
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2 border-t border-border-subtlest-tertiary pt-4">
          {stores.map((store) => (
            <Button
              key={store.id}
              tag="a"
              href={store.href}
              target="_blank"
              rel="noopener"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Medium}
              className="flex-1"
              icon={<store.Icon size={store.iconSize} />}
              onClick={() => onStoreClick(store)}
            >
              {store.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default GetAppButton;
