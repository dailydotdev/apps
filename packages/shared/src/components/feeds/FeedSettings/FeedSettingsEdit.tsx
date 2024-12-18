import React, { ReactElement, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useFeedSettingsEdit } from './useFeedSettingsEdit';
import { Modal } from '../../modals/common/Modal';
import {
  AddUserIcon,
  AppIcon,
  BlockIcon,
  DevPlusIcon,
  EditIcon,
  FilterIcon,
  HashtagIcon,
  MagicIcon,
} from '../../icons';
import { FeedSettingsMenu, feedSettingsMenuTitle } from './types';
import { IconSize } from '../../Icon';
import { FeedSettingsEditContext } from './FeedSettingsEditContext';
import { FeedSettingsEditHeader } from './FeedSettingsEditHeader';
import { FeedSettingsEditBody } from './FeedSettingsEditBody';
import { FeedSettingsGeneralSection } from './sections/FeedSettingsGeneralSection';
import { FeedSettingsTitle } from './FeedSettingsTitle';
import { FeedSettingsTagsSection } from './sections/FeedSettingsTagsSection';
import { FeedSettingsContentPreferencesSection } from './sections/FeedSettingsContentPreferencesSection';
import { FeedSettingsAISection } from './sections/FeedSettingsAISection';
import { FeedSettingsFiltersSection } from './sections/FeedSettingsFiltersSection';
import { FeedSettingsContentSourcesSection } from './sections/FeedSettingsContentSourcesSection';
import { webappUrl } from '../../../lib/constants';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { FeedType } from '../../../graphql/feed';
import { FeedSettingsBlockingSection } from './sections/FeedSettingsBlockingSection';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { LogEvent, TargetId } from '../../../lib/log';
import { Button } from '../../buttons/Button';
import useCustomDefaultFeed from '../../../hooks/feed/useCustomDefaultFeed';

export type FeedSettingsEditProps = {
  feedSlugOrId: string;
};

export const FeedSettingsEdit = ({
  feedSlugOrId,
}: FeedSettingsEditProps): ReactElement => {
  const router = useRouter();
  const feedSettingsEditContext = useFeedSettingsEdit({ feedSlugOrId });
  const { feed } = feedSettingsEditContext;
  const { isPlus, showPlusSubscription, logSubscriptionEvent } =
    usePlusSubscription();

  const { isCustomDefaultFeed, defaultFeedId } = useCustomDefaultFeed();
  const tabs = useMemo(() => {
    return [
      {
        title: feedSettingsMenuTitle.general,
        options: { icon: <EditIcon size={IconSize.Small} /> },
      },
      {
        title: feedSettingsMenuTitle.tags,
        options: { icon: <HashtagIcon size={IconSize.Small} /> },
      },
      !isPlus &&
        showPlusSubscription && {
          title: 'Upgrade to Plus',
          options: {
            icon: <></>,
            customElement: (
              <div className="flex w-full flex-col justify-center gap-4 rounded-10 border border-border-subtlest-tertiary bg-action-plus-float p-4">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Primary}
                >
                  Upgrade to daily.dev plus today and be among the first to
                  create advanced custom feeds!
                </Typography>
                <Button
                  tag="a"
                  type="button"
                  variant={ButtonVariant.Primary}
                  size={ButtonSize.Medium}
                  href={`${webappUrl}plus`}
                  icon={<DevPlusIcon className="text-action-plus-default" />}
                  onClick={() => {
                    logSubscriptionEvent({
                      event_name: LogEvent.UpgradeSubscription,
                      target_id: TargetId.FeedSettings,
                    });
                  }}
                >
                  Upgrade to Plus
                </Button>
              </div>
            ),
          },
        },
      {
        title: feedSettingsMenuTitle.sources,
        options: { icon: <AddUserIcon size={IconSize.Small} /> },
      },
      {
        title: feedSettingsMenuTitle.preferences,
        options: { icon: <AppIcon size={IconSize.Small} /> },
      },
      {
        title: feedSettingsMenuTitle.ai,
        options: { icon: <MagicIcon size={IconSize.Small} /> },
      },
      feed?.type === FeedType.Custom && {
        title: feedSettingsMenuTitle.filters,
        options: { icon: <FilterIcon size={IconSize.Small} /> },
      },
      {
        title: feedSettingsMenuTitle.blocking,
        options: { icon: <BlockIcon size={IconSize.Small} /> },
      },
    ].filter(Boolean);
  }, [feed?.type, isPlus, showPlusSubscription, logSubscriptionEvent]);

  const defaultView = useMemo(() => {
    return feedSettingsMenuTitle[router.query.dview as FeedSettingsMenu];
  }, [router.query.dview]);

  const canEditFeed = isPlus || feed?.type === FeedType.Main;

  useEffect(() => {
    if (!canEditFeed) {
      router.replace(webappUrl);
    }
  }, [canEditFeed, router, feedSlugOrId]);

  if (!canEditFeed) {
    return null;
  }

  if (!feed) {
    return null;
  }

  return (
    <FeedSettingsEditContext.Provider value={feedSettingsEditContext}>
      <Modal
        isOpen
        className="h-full flex-1 overflow-auto !bg-surface-invert"
        kind={Modal.Kind.FlexibleCenter}
        size={Modal.Size.XLarge}
        tabs={tabs}
        onRequestClose={() => {
          if (
            feed?.type === FeedType.Main ||
            (isCustomDefaultFeed && feedSlugOrId === defaultFeedId)
          ) {
            router.replace(webappUrl);
          } else {
            router.replace(`${webappUrl}feeds/${feedSlugOrId}`);
          }
        }}
        defaultView={defaultView}
      >
        <FeedSettingsEditHeader />
        <Modal.Sidebar>
          <Modal.Sidebar.List
            className="w-74 bg-transparent"
            title={<FeedSettingsTitle />}
            defaultOpen
          />
          <Modal.Sidebar.Inner>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.general}>
              <FeedSettingsGeneralSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.tags}>
              <FeedSettingsTagsSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.sources}>
              <FeedSettingsContentSourcesSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.preferences}>
              <FeedSettingsContentPreferencesSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.ai}>
              <FeedSettingsAISection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.filters}>
              <FeedSettingsFiltersSection />
            </FeedSettingsEditBody>
            <FeedSettingsEditBody view={feedSettingsMenuTitle.blocking}>
              <FeedSettingsBlockingSection />
            </FeedSettingsEditBody>
          </Modal.Sidebar.Inner>
        </Modal.Sidebar>
      </Modal>
    </FeedSettingsEditContext.Provider>
  );
};
