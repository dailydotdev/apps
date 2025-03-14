import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { SquadDetails } from '@dailydotdev/shared/src/components/squads/Details';
import { DefaultSquadHeader } from '@dailydotdev/shared/src/components/layout/DefaultSquadHeader';
import { editSquad } from '@dailydotdev/shared/src/graphql/squads';
import { useBoot } from '@dailydotdev/shared/src/hooks/useBoot';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import type { SquadSettingsProps } from '@dailydotdev/shared/src/components/squads/utils';
import { ManageSquadPageContainer } from '@dailydotdev/shared/src/components/squads/utils';
import { MangeSquadPageSkeleton } from '@dailydotdev/shared/src/components/squads/MangeSquadPageSkeleton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSquad } from '@dailydotdev/shared/src/hooks';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { parseOrDefault } from '@dailydotdev/shared/src/lib/func';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import {
  SquadTab,
  SquadTabs,
} from '@dailydotdev/shared/src/components/squads/SquadTabs';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';

const seo: NextSeoProps = {
  title: getTemplatedTitle('Squad settings'),
  openGraph: { ...defaultOpenGraph },
  nofollow: true,
  noindex: true,
  ...defaultSeo,
};

const DEFAULT_ERROR = "Oops! That didn't seem to work. Let's try again!";

const EditSquad = ({ handle }: SquadSettingsProps): ReactElement => {
  const { isReady: isRouteReady } = useRouter();
  const { squads, user, isAuthReady, isFetched } = useAuthContext();
  const {
    squad,
    isLoading: isSquadLoading,
    isForbidden,
  } = useSquad({ handle });
  const queryClient = useQueryClient();
  const { updateSquad } = useBoot();
  const { displayToast } = useToastNotification();
  const { mutateAsync: onUpdateSquad, isPending: isUpdatingSquad } =
    useMutation({
      mutationFn: editSquad,
      onSuccess: async (data) => {
        const queryKey = generateQueryKey(RequestKey.Squad, user, data.handle);
        await queryClient.invalidateQueries({ queryKey });
        updateSquad(data);
        displayToast('The Squad has been updated');
      },
      onError: (error: ApiErrorResult) => {
        const result = parseOrDefault<Record<string, string>>(
          error?.response?.errors?.[0]?.message,
        );

        displayToast(
          typeof result === 'object' ? result.handle : DEFAULT_ERROR,
        );
      },
    });

  const isLoading =
    !isFetched || isSquadLoading || !isAuthReady || !isRouteReady;

  if (isLoading) {
    return (
      <MangeSquadPageSkeleton>
        <DefaultSquadHeader className="border-b-0" />
      </MangeSquadPageSkeleton>
    );
  }

  const isUnauthorized =
    !user || isForbidden || (!squads?.length && isAuthReady);

  if (isUnauthorized) {
    return <Unauthorized />;
  }

  return (
    <ManageSquadPageContainer>
      <SquadDetails
        squad={squad}
        onSubmit={(_, form) =>
          onUpdateSquad({ id: squad.id, form: { ...squad, ...form } })
        }
        isLoading={isUpdatingSquad}
      >
        {squad?.moderationRequired && (
          <SquadTabs active={SquadTab.Settings} handle={squad.handle} />
        )}
      </SquadDetails>
    </ManageSquadPageContainer>
  );
};

EditSquad.getLayout = getMainLayout;
EditSquad.layoutProps = { seo };

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

interface SquadPageParams extends ParsedUrlQuery {
  handle: string;
}

export function getStaticProps({
  params,
}: GetStaticPropsContext<SquadPageParams>): GetStaticPropsResult<SquadSettingsProps> {
  return {
    props: {
      handle: params.handle,
    },
  };
}

export default EditSquad;
