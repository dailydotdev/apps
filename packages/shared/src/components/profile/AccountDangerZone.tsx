import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/ButtonV2';

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
      <div className="typo-callout text-theme-label-tertiary">
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
          className="text-theme-label-link"
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
        className="self-start mt-6"
      >
        Delete account
      </Button>
    </section>
  );
}

export default AccountDangerZone;
