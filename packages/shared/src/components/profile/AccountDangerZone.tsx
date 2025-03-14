import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { DangerZone } from '../widgets/DangerZone';
import { anchorDefaultRel } from '../../lib/strings';
import { usePlusSubscription } from '../../hooks';
import { SubscriptionProvider, UserSubscriptionStatus } from '../../lib/plus';

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
      rel={anchorDefaultRel}
    >
      support@daily.dev
    </a>{' '}
    with any questions.
  </>
);

const ImportantActiveAppleSubscription = () => {
  return (
    <>
      You have an active subscription. To proceed with account deletion,
      you&apos;ll need to cancel your subscription first (via Apple). Contact{' '}
      <a
        className="text-text-link"
        href="mailto:support@daily.dev?subject=I have a question about deleting my account"
        target="_blank"
        rel={anchorDefaultRel}
      >
        support@daily.dev
      </a>{' '}
      with any questions.
    </>
  );
};

function AccountDangerZone({
  onDelete,
  className,
}: AccountDangerZoneProps): ReactElement {
  const { isPlus, status, plusProvider } = usePlusSubscription();

  const disableDeletion =
    isPlus &&
    status === UserSubscriptionStatus.Active &&
    plusProvider === SubscriptionProvider.AppleStoreKit;

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
      important={
        disableDeletion ? <ImportantActiveAppleSubscription /> : <Important />
      }
      buttonDisabled={disableDeletion}
    />
  );
}

export default AccountDangerZone;
