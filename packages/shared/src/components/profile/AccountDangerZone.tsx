import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';

interface AccountDangerZoneProps {
  onDelete: () => void;
  className?: string;
  children?: ReactNode;
}

function AccountDangerZone({
  onDelete,
  className,
  children,
}: AccountDangerZoneProps): ReactElement {
  return (
    <section className={classNames('flex flex-col', className)}>
      <div className="text-text-tertiary typo-callout">
        Deleting your account will:
        <br />
        <br />
        <ol>
          <li>
            1. Permanently delete your profile, along with your authentication
            associations.
          </li>
          <li>
            2. Permanently delete all your content, including your posts,
            bookmarks, comments, upvotes, etc.
          </li>
          <li>3. Allow your username to become available to anyone.</li>
        </ol>
        <br />
        Important: deleting your account is unrecoverable and cannot be undone.
        Feel free to contact{' '}
        <a
          className="text-text-link"
          href="mailto:support@daily.dev?subject=I have a question about deleting my account"
          target="_blank"
          rel="noopener"
        >
          support@daily.dev
        </a>{' '}
        with any questions.
      </div>
      {children}
      <Button
        onClick={onDelete}
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        color={ButtonColor.Ketchup}
        className="mt-6 self-start"
      >
        Delete account
      </Button>
    </section>
  );
}

export default AccountDangerZone;
