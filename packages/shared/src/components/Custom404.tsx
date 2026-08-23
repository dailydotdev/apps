import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import Link from './utilities/Link';
import { PageContainer } from './utilities';
import { Button, ButtonVariant } from './buttons/Button';
import { cloudinaryCharm404 } from '../lib/image';
import { Image } from './image/Image';
import { squadCategoriesPaths, webappUrl } from '../lib/constants';

interface Custom404Props {
  children?: ReactNode;
  /**
   * Opt in to the secondary recovery nav. Off by default: this component
   * also renders inside the post modal, the agent side pane and the
   * extension new tab, where a full-site nav is the wrong furniture and
   * navigating away is not what the surface wants.
   */
  showRecoveryLinks?: boolean;
}

// Absolute, because this component reaches the browser extension through
// BasePostContent, where a root-relative href resolves against
// chrome-extension://<id>/ and dies.
const recoveryLinks = [
  { label: 'Explore', href: `${webappUrl}posts` },
  { label: 'Tags', href: `${webappUrl}tags` },
  { label: 'Sources', href: `${webappUrl}sources` },
  {
    label: 'Squads',
    href: `${webappUrl}${squadCategoriesPaths.discover.substring(1)}`,
  },
];

export default function Custom404({
  children,
  showRecoveryLinks = false,
}: Custom404Props): ReactElement {
  return (
    <PageContainer
      className="min-h-page !items-center justify-center"
      data-testid="notFound"
    >
      {children}
      <div className="flex w-full max-w-[26.25rem] flex-col items-center gap-6 text-center">
        <Image
          className="h-40 w-40 object-contain"
          src={cloudinaryCharm404}
          alt="404 - Page not found"
          loading="lazy"
        />
        <h1 className="font-bold typo-large-title">Why are you here?</h1>
        <p className="text-text-tertiary typo-callout">
          You’re not supposed to be here.
        </p>
        <Link href="/" passHref>
          <Button tag="a" variant={ButtonVariant.Primary}>
            Go home
          </Button>
        </Link>

        {showRecoveryLinks && (
          <nav aria-label="Other places to go">
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {recoveryLinks.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-text-tertiary underline typo-footnote hover:text-text-primary"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </PageContainer>
  );
}
