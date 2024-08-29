import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { DangerZone } from '../../widgets/DangerZone';
import { SquadSettingsSection } from './SquadSettingsSection';
import { useDeleteSquad } from '../../../hooks/useDeleteSquad';
import { Squad } from '../../../graphql/sources';

interface SquadDangerZoneProps {
  squad: Squad;
}

const Important = () => (
  <>
    Important: deleting your Squad is unrecoverable and cannot be undone. Feel
    free to contact{' '}
    <a
      className="text-text-link"
      href="mailto:support@daily.dev?subject=I have a question about deleting my Squad"
      target="_blank"
      rel="noopener"
    >
      support@daily.dev
    </a>{' '}
    with any questions.
  </>
);

export function SquadDangerZone({ squad }: SquadDangerZoneProps): ReactElement {
  const router = useRouter();
  const { onDeleteSquad } = useDeleteSquad({
    squad,
    callback: () => router.replace('/'),
  });

  return (
    <SquadSettingsSection title="🚨 Danger zone">
      <DangerZone
        onClick={onDeleteSquad}
        className="mt-4"
        cta="Delete account"
        title="Deleting your account will:"
        notes={[
          'Permanently delete your Squad.',
          'Permanently delete all Squad’s content, including your posts and others, comments, upvotes, etc',
          'Allow your Squad name to become available to anyone.',
        ]}
        important={<Important />}
      />
    </SquadSettingsSection>
  );
}
