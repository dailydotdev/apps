import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import Link from './utilities/Link';
import { PageContainer } from './utilities';
import { Button, ButtonVariant } from './buttons/Button';
import { cloudinaryCharm404 } from '../lib/image';
import { Image } from './image/Image';

interface Custom404Props {
  children?: ReactNode;
}

// Every destination here is reachable on both hosts this renders on
// (daily.dev and app.daily.dev). A dead end on the 404 page is worse than
// no link at all, so keep that true if this list changes.
const recoveryLinks = [
  { label: 'Explore', href: '/posts' },
  { label: 'Tags', href: '/tags' },
  { label: 'Sources', href: '/sources' },
  { label: 'Squads', href: '/squads/discover' },
  { label: 'Blog', href: '/blog' },
];

export default function Custom404({ children }: Custom404Props): ReactElement {
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

        <nav aria-label="Other places to go" className="mt-2">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {recoveryLinks.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} passHref prefetch={false}>
                  <a className="text-text-tertiary underline typo-footnote hover:text-text-primary">
                    {label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </PageContainer>
  );
}
