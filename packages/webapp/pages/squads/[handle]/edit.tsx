import React, { ReactElement } from 'react';
import { NextSeo, NextSeoProps } from 'next-seo';
import router, { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { SquadDetails } from '@dailydotdev/shared/src/components/squads/Details';
import { SquadForm, editSquad } from '@dailydotdev/shared/src/graphql/squads';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import {
  ManageSquadPageContainer,
  ManageSquadPageMain,
  ManageSquadPageHeader,
} from '@dailydotdev/shared/src/components/squads/utils';
import { MangeSquadPageSkeleton } from '@dailydotdev/shared/src/components/squads/MangeSquadPageSkeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useSquad } from '@dailydotdev/shared/src/hooks';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useSquads } from '@dailydotdev/shared/src/hooks/squads/useSquads';
import { defaultOpenGraph, defaultSeo } from '../../../next-seo';
import { getLayout as getMainLayout } from '../../../components/layouts/MainLayout';

type EditSquadPageProps = { handle: string };

const pageTitle = 'Squad settings';

const seo: NextSeoProps = {
  title: pageTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const EditSquad = ({ handle }: EditSquadPageProps): ReactElement => {
  const { isReady: isRouteReady } = useRouter();
  const { user, isAuthReady, isFetched } = useAuthContext();
  const { squads } = useSquads();
  const {
    squad,
    isLoading: isSquadLoading,
    isForbidden,
  } = useSquad({ handle });
  const queryClient = useQueryClient();
  const { updateSquad } = useSquads();
  const { displayToast } = useToastNotification();

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
    };
    const editedSquad = await editSquad(squad.id, formJson);
    if (editedSquad) {
      const queryKey = generateQueryKey(
        RequestKey.Squad,
        user,
        editedSquad.handle,
      );
      await queryClient.invalidateQueries(queryKey);
      await updateSquad(editedSquad);
      displayToast('The Squad has been updated');
    }
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
      <ManageSquadPageMain>
        <ManageSquadPageHeader className="hidden tablet:flex">
          <Button
            className="mr-2"
            variant={ButtonVariant.Tertiary}
            icon={<ArrowIcon className="-rotate-90" />}
            size={ButtonSize.XSmall}
            onClick={() => {
              router.push(`/squads/${squad.handle}`);
            }}
          />
          <h1 className="font-bold typo-title3">{pageTitle}</h1>
        </ManageSquadPageHeader>
        <SquadDetails
          className="p-8"
          form={squad}
          onSubmit={onSubmit}
          createMode={false}
        />
      </ManageSquadPageMain>
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
