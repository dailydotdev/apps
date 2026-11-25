import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { DangerZone } from '../../widgets/DangerZone';
import { useDeleteSquad } from '../../../hooks/useDeleteSquad';
import type { Squad } from '../../../graphql/sources';
import { anchorDefaultRel } from '../../../lib/strings';
import { isCompanyPage } from '../../../features/squads/lib/companyPage';

interface SquadDangerZoneProps {
  squad: Squad;
}

const Important = ({ noun }: { noun: string }) => (
  <>
    Important: deleting your {noun} is unrecoverable and cannot be undone. Feel
    free to contact{' '}
    <a
      className="text-text-link"
      href={`mailto:support@daily.dev?subject=I have a question about deleting my ${noun}`}
      target="_blank"
      rel={anchorDefaultRel}
    >
      support@daily.dev
    </a>{' '}
    with any questions.
  </>
);

export function SquadDangerZone({ squad }: SquadDangerZoneProps): ReactElement {
  const router = useRouter();
  const { isPending, onDeleteSquad } = useDeleteSquad({
    squad,
    callback: () => router.replace('/'),
  });

  const isCompany = isCompanyPage(squad);
  const noun = isCompany ? 'page' : 'Squad';

  return (
    <DangerZone
      onClick={onDeleteSquad}
      cta={isCompany ? 'Delete page' : 'Delete Squad'}
      title={`Deleting your ${noun} will:`}
      notes={[
        `Permanently delete your ${noun}.`,
        isCompany
          ? 'Permanently delete all the page’s content, including posts, comments, upvotes, etc'
          : 'Permanently delete all Squad’s content, including your posts and others, comments, upvotes, etc',
        `Allow your ${noun} handle to become available to anyone.`,
      ]}
      important={<Important noun={noun} />}
      buttonDisabled={isPending}
      buttonLoading={isPending}
    />
  );
}
