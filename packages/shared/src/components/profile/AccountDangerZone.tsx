import React, { ReactElement, ReactNode } from 'react';
import { DangerZone } from '../widgets/DangerZone';

interface AccountDangerZoneProps {
  onDelete: () => void;
  className?: string;
  children?: ReactNode;
}

const Important = () => (
  <>
    Important: deleting your account is unrecoverable and cannot be undone. Feel
    free to contact{' '}
    <a
      className="text-text-link"
      href="mailto:support@daily.dev?subject=I have a question about deleting my account"
      target="_blank"
      rel="noopener"
    >
      support@daily.dev
    </a>{' '}
    with any questions.
  </>
);

function AccountDangerZone({
  onDelete,
  className,
}: AccountDangerZoneProps): ReactElement {
  return (
    <DangerZone
      onClick={onDelete}
      className={className}
      cta="Delete account"
      title="Deleting your account will:"
      notes={[
        'Permanently delete your profile, along with your authentication associations.',
        'Permanently delete all your content, including your posts, bookmarks, comments, upvotes, etc.',
        'Allow your username to become available to anyone.',
      ]}
      important={<Important />}
    />
  );
}

export default AccountDangerZone;
