import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { SquadDetails } from '@dailydotdev/shared/src/components/squads/Details';
import { MangeSquadPageSkeleton } from '@dailydotdev/shared/src/components/squads/MangeSquadPageSkeleton';
import { ManageSquadPageContainer } from '@dailydotdev/shared/src/components/squads/utils';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { editSquad, SquadForm } from '@dailydotdev/shared/src/graphql/squads';
import { useSquad } from '@dailydotdev/shared/src/hooks';
import { PrivacyOption } from '@dailydotdev/shared/src/hooks/squads/useSquadPrivacyOptions';
import { useBoot } from '@dailydotdev/shared/src/hooks/useBoot';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import {
  isNullOrUndefined,
  parseOrDefault,
} from '@dailydotdev/shared/src/lib/func';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { useRouter } from 'next/router';
import { NextSeo, NextSeoProps } from 'next-seo';
import { ParsedUrlQuery } from 'querystring';
import React, { ReactElement } from 'react';

import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';

type EditSquadPageProps = { handle: string };

const pageTitle = 'Squad settings';

const seo: NextSeoProps = {
  title: pageTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const DEFAULT_ERROR = "Oops! That didn't seem to work. Let's try again!";

const EditSquad = ({ handle }: EditSquadPageProps): ReactElement => {
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
  const { mutateAsync: onUpdateSquad, isLoading: isUpdatingSquad } =
    useMutation(editSquad, {
      onSuccess: async (data) => {
        const queryKey = generateQueryKey(RequestKey.Squad, user, data.handle);
        await queryClient.invalidateQueries(queryKey);
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

  const onSubmit = async (e, form: SquadForm) => {
    e.preventDefault();
    const formJson = {
      ...squad,
      name: form.name,
      description: form.description,
      handle: form.handle,
      file: form.file,
      memberPostingRole: form.memberPostingRole,
      memberInviteRole: form.memberInviteRole,
      public: isNullOrUndefined(form.status)
        ? undefined
        : form.status === PrivacyOption.Public,
    };
    onUpdateSquad({ id: squad.id, form: formJson });
  };

  const isLoading =
    !isFetched || isSquadLoading || !isAuthReady || !isRouteReady;

  if (isLoading) {
    return <MangeSquadPageSkeleton />;
  }

  const isUnauthorized =
    !user || isForbidden || (!squads?.length && isAuthReady);

  if (isUnauthorized) {
    return <Unauthorized />;
  }

  return (
    <ManageSquadPageContainer>
      <NextSeo {...seo} titleTemplate="%s | daily.dev" noindex nofollow />
      <SquadDetails
        form={squad}
        onSubmit={onSubmit}
        createMode={false}
        isLoading={isUpdatingSquad}
      />
    </ManageSquadPageContainer>
  );
};

EditSquad.getLayout = getMainLayout;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

interface SquadPageParams extends ParsedUrlQuery {
  handle: string;
}

export function getStaticProps({
  params,
}: GetStaticPropsContext<SquadPageParams>): GetStaticPropsResult<EditSquadPageProps> {
  return {
    props: {
      handle: params.handle,
    },
  };
}

export default EditSquad;
