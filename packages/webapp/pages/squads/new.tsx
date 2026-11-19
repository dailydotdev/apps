import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import router, { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { SquadDetails } from '@dailydotdev/shared/src/components/squads/Details';
import {
  ManageSquadPageContainer,
  SquadSubTitle,
  SquadTitle,
} from '@dailydotdev/shared/src/components/squads/utils';
import { MangeSquadPageSkeleton } from '@dailydotdev/shared/src/components/squads/MangeSquadPageSkeleton';
import { useSquadCreate } from '@dailydotdev/shared/src/hooks/squads/useSquadCreate';
import {
  cloudinarySquadsCreateSquadMobile,
  cloudinarySquadsCreateSquadBiggerThanMobile,
} from '@dailydotdev/shared/src/lib/image';
import { SourceIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import { useIntegrationQuery } from '@dailydotdev/shared/src/hooks/integrations/useIntegrationQuery';

import { useSlackConnectSourceMutation } from '@dailydotdev/shared/src/hooks/integrations/slack/useSlackConnectSourceMutation';
import { SourceMemberRole } from '@dailydotdev/shared/src/graphql/sources';
import { PromptElement } from '@dailydotdev/shared/src/components/modals/Prompt';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { CompanyPageCreate } from '@dailydotdev/shared/src/features/squads/components/companyPage/CompanyPageCreate';
import { saveCheckoutAttribution } from '@dailydotdev/shared/src/features/squads/lib/checkoutAttribution';
import type { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import MainLayout from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seoTitles = getPageSeoTitles('Create your Squad');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  nofollow: true,
  noindex: true,
  ...defaultSeo,
};

const NewSquad = (): ReactElement => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>();
  const { isReady: isRouteReady, query } = useRouter();
  const { user, isAuthReady, isFetched } = useAuthContext();
  const { onSave } = useSlackConnectSourceMutation();
  const shouldLoadIntegration = query?.fs && !query?.error;
  const integrationId = query?.iid as string;

  // The /startups ad source, kept for the checkout when the page upgrades
  useEffect(() => {
    if (isRouteReady && query.company) {
      saveCheckoutAttribution(query);
    }
  }, [isRouteReady, query]);

  const { onCreateSquad, isLoading } = useSquadCreate({
    onSuccess: async (squad) => {
      if (selectedChannel) {
        await onSave({
          channelId: selectedChannel,
          integrationId,
          sourceId: squad.id!,
        });
      }

      router.push(squad.permalink);
    },
  });
  const isMobile = useViewSize(ViewSize.MobileL);

  const { data, isPending: isIntegrationLoading } = useIntegrationQuery({
    id: integrationId,
    queryOptions: { enabled: !!shouldLoadIntegration && !!integrationId },
  });

  const initialHandle = data?.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

  const handleClose = async () => {
    router.push('/squads');
  };

  if (
    !isFetched ||
    !isAuthReady ||
    !isRouteReady ||
    (isIntegrationLoading && !!shouldLoadIntegration)
  ) {
    return <MangeSquadPageSkeleton />;
  }

  if (query.company) {
    return (
      <>
        <CompanyPageCreate />
        <PromptElement />
        <Toast autoDismissNotifications />
      </>
    );
  }

  if (!user) {
    return <Unauthorized />;
  }

  return (
    <ManageSquadPageContainer>
      <SquadDetails
        onRequestClose={handleClose}
        onSubmit={(e, form, channelId) => {
          setSelectedChannel(channelId);
          onCreateSquad(form);
        }}
        isLoading={isLoading}
        initialData={{
          name: data?.name,
          handle: initialHandle,
          memberPostingRole: SourceMemberRole.Member,
          moderationRequired: true,
        }}
        integrationId={integrationId}
      >
        <div className="bg-cover bg-center tablet:flex tablet:flex-row">
          <div className="mx-4 mt-4 flex flex-1 flex-col gap-2 tablet:mx-6 tablet:my-5">
            <SquadTitle className="hidden flex-row tablet:flex">
              <SourceIcon className="mr-0.5" size={IconSize.XLarge} />
              Create new Squad
            </SquadTitle>
            <SquadSubTitle>
              Create a group where you can learn and interact privately with
              other developers around topics that matter to you
            </SquadSubTitle>
          </div>
          <img
            className="hidden w-full tablet:block tablet:h-[9.6875rem] tablet:w-[15.625rem]"
            src={
              isMobile
                ? cloudinarySquadsCreateSquadMobile
                : cloudinarySquadsCreateSquadBiggerThanMobile
            }
            alt="A collection of other people's avatars"
          />
        </div>
      </SquadDetails>
    </ManageSquadPageContainer>
  );
};

// The company page path is a focused funnel page, with no app header or
// sidebar, like the Startups checkout.
const NewSquadLayout = ({
  children,
  layoutProps,
}: {
  children: ReactElement;
  layoutProps?: MainLayoutProps;
}): ReactElement | null => {
  const { isReady, query, asPath } = useRouter();

  if (!isReady) {
    return null;
  }

  if (query.company) {
    return children;
  }

  return (
    <MainLayout {...layoutProps} activePage={asPath}>
      {children}
    </MainLayout>
  );
};

NewSquad.getLayout = (
  page: ReactElement,
  _: unknown,
  layoutProps?: MainLayoutProps,
) => <NewSquadLayout layoutProps={layoutProps}>{page}</NewSquadLayout>;
NewSquad.layoutProps = { seo };

export default NewSquad;
