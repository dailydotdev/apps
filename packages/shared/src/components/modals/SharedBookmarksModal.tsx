import React, { ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import XIcon from '../../../icons/x.svg';
import AuthContext from '../../contexts/AuthContext';
import ProfileForm from '../profile/ProfileForm';
import { Button } from '../buttons/Button';
import { ResponsiveModal } from './ResponsiveModal';
import { ModalProps } from './StyledModal';
import { ProfileHeading } from '../utilities';
import styles from './AccountDetailsModal.module.css';
import classed from '../../lib/classed';
import { Switch } from '../fields/Switch';

export default function AccountDetailsModal({
  className,
  ...props
}: ModalProps): ReactElement {
  const { user } = useContext(AuthContext);
  const [shareBookmarks, osetShareBookmarks] = useState(false);

  const onShareBookmarks = () => {};

  return (
    <>
      <ResponsiveModal
        className={classNames(className, styles.accountDetailsModal)}
        {...props}
      >
        <header className="flex fixed responsiveModalBreakpoint:sticky top-0 left-0 z-3 justify-between items-center px-4 w-full h-12 border-b bg-theme-bg-secondary border-theme-divider-tertiary">
          <ProfileHeading className="mt-2">Account Details</ProfileHeading>
          <Button
            title="Close"
            onClick={props.onRequestClose}
            icon={<XIcon />}
            className="btn-tertiary"
          />
        </header>
        <div className="px-6 mobileL:px-10 pt-6 pb-4">
          <Switch
            inputId="share-bookmarks-switch"
            name="hide-read"
            className="my-3"
            checked={shareBookmarks}
            onToggle={onShareBookmarks}
            compact={false}
          >
            Public mode
          </Switch>
        </div>
        <footer className="flex flex-col px-6 mobileL:px-10 pb-6 -my-1"></footer>
        <section className="flex flex-col px-6 mobileL:px-10 pb-10">
          <p className="typo-callout text-theme-label-tertiary">
            Switching to public mode will generate a public rss feed of your
            bookmarks. Use this link to integrate and automatically share your
            bookmarks with other developers.
            <br />

            <a
              className="text-theme-label-link"
              href="mailto:support@daily.dev?subject=I have a question about deleting my account"
              target="_blank"
              rel="noopener"
            >
              support@daily.dev
            </a>{' '}
            with any questions.
          </p>
        </section>
      </ResponsiveModal>
    </>
  );
}
