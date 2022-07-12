import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ownershipGuide } from '../../lib/constants';
import { Button } from '../buttons/Button';
import FeatherIcon from '../icons/Feather';
import styles from './AuthorOnboarding.module.css';

interface AuthorOnboardingProps {
  onSignUp?: () => unknown;
}

export function AuthorOnboarding({
  onSignUp,
}: AuthorOnboardingProps): ReactElement {
  return (
    <section
      className={classNames(
        'p-6 bg-theme-bg-secondary rounded-2xl mb-6',
        styles.authorOnboarding,
      )}
    >
      <div
        className={classNames(
          'grid items-center gap-x-3',
          styles.authorOnboardingHeader,
        )}
        style={{ gridTemplateColumns: 'repeat(2, max-content)' }}
      >
        <FeatherIcon size="xxlarge" className="text-theme-status-help icon" />
        <h3>Author</h3>
        <h2>Is this article yours?</h2>
      </div>
      <p>Claim ownership and get the following perks:</p>
      <ol>
        <li>Get notified when your articles are picked by daily.dev feed</li>
        <li>Exclusive author badge on your comments</li>
        <li>Analytics report for every post you wrote</li>
        <li>Gain reputation points by earning upvotes on articles you wrote</li>
      </ol>
      <div
        className="grid grid-flow-col gap-x-4 mt-6 max-w-[18.5rem]"
        data-testid="authorOnboarding"
        style={{
          gridTemplateColumns: '1fr max-content',
        }}
      >
        {onSignUp && (
          <Button className="btn-primary" onClick={onSignUp}>
            Sign up
          </Button>
        )}
        <Button
          className="btn-secondary"
          tag="a"
          href={ownershipGuide}
          target="_blank"
          rel="noopener"
        >
          Learn more
        </Button>
      </div>
    </section>
  );
}
