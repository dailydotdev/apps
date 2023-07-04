import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import router, { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import {
  BasePageContainer,
  pageBorders,
} from '@dailydotdev/shared/src/components/utilities';
import classed from '@dailydotdev/shared/src/lib/classed';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { SquadDetails } from '@dailydotdev/shared/src/components/squads/Details';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { SquadForm, createSquad } from '@dailydotdev/shared/src/graphql/squads';
import { useBoot } from '@dailydotdev/shared/src/hooks/useBoot';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import {
  AnalyticsEvent,
  Origin,
  TargetType,
} from '@dailydotdev/shared/src/lib/analytics';
import SourceIcon from '@dailydotdev/shared/src/components/icons/Source';
import {
  SquadTitle,
  SquadSubTitle,
} from '@dailydotdev/shared/src/components/squads/utils';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import { getLayout as getMainLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const DEFAULT_ERROR = "Oops! That didn't seem to work. Let's try again!";

export const ManageSquadPageContainer = classed(
  BasePageContainer,
  '!p-0 laptop:min-h-page h-full !max-w-[42.5rem] !w-full',
  pageBorders,
);

export const ManageSquadPageMain = classed('div', 'flex flex-1 flex-col');

export const ManageSquadPageFooter = classed(
  'footer',
  'flex sticky flex-row gap-3 items-center p-3 px-8 mt-auto h-16 border-t border-theme-divider-tertiary',
);

export const MangeSquadPageSkeleton = (): ReactElement => {
  return (
    <ManageSquadPageContainer>
      <ManageSquadPageMain className="items-center">
        <ElementPlaceholder className="w-full h-60" />
        <div className="flex flex-col items-center w-full max-w-lg">
          <ElementPlaceholder className="mx-8 mt-6 w-full h-12 rounded-12" />
          <ElementPlaceholder className="mx-8 mt-4 w-full h-12 rounded-12" />
        </div>
      </ManageSquadPageMain>
      <ManageSquadPageFooter />
    </ManageSquadPageContainer>
  );
};

const seo: NextSeoProps = {
  title: 'Create your Squad',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const NewSquad = (): ReactElement => {
  const { isReady: isRouteReady, query } = useRouter();
  const origin = query.origin as Origin;
  const { squads, user, isAuthReady, isFetched } = useAuthContext();
  const { trackEvent } = useContext(AnalyticsContext);
  const { displayToast } = useToastNotification();
  const { addSquad } = useBoot();
  const [form] = useState<Partial<SquadForm>>({});

  useEffect(() => {
    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.CreateSquadPopup,
      extra: JSON.stringify({ origin }),
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async (e, newSquadForm: SquadForm) => {
    e.preventDefault();
    const data = { ...newSquadForm } as SquadForm;

    try {
      const newSquad = await createSquad({ ...data });

      if (!newSquad) {
        return;
      }

      trackEvent({
        event_name: AnalyticsEvent.CompleteSquadCreation,
      });

      addSquad(newSquad);

      await router.replace(newSquad.permalink);
    } catch (err) {
      displayToast(DEFAULT_ERROR);
    }
  };

  const handleClose = async () => {
    router.push('/squads');
  };

  if (!isFetched || !isAuthReady || !isRouteReady) {
    return <MangeSquadPageSkeleton />;
  }

  if (!user || (!squads?.length && isAuthReady)) {
    return <Unauthorized />;
  }

  return (
    <ManageSquadPageContainer>
      <NextSeo {...seo} titleTemplate="%s | daily.dev" />
      <ManageSquadPageMain>
        <div
          style={{
            backgroundImage: `url(${cloudinary.squads.createSquad})`,
          }}
          className="flex flex-col justify-center items-center mb-6 w-full h-60"
        >
          <SourceIcon className="!w-20 !h-20" />
          <SquadTitle className="mb-2">Squads early access!</SquadTitle>
          <SquadSubTitle>
            Create a group where you can learn and interact privately with other
            developers around topics that matter to you
          </SquadSubTitle>
        </div>
        <SquadDetails
          className="p-8 pt-0"
          form={form}
          onRequestClose={handleClose}
          onSubmit={onCreate}
          createMode
        />
      </ManageSquadPageMain>
    </ManageSquadPageContainer>
  );
};

NewSquad.getLayout = getMainLayout;

export default NewSquad;
