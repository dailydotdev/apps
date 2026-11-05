import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { Squad } from '../../../../graphql/sources';
import { OpenLinkIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { SpotlightProvider } from '../../../../components/spotlight/SpotlightContext';
import { SquadPageContextProvider } from '../../SquadPageContext';
import { SquadProfileHeader } from '../header/SquadProfileHeader';
import type { SquadProduct } from '../../../../graphql/squadProducts';

// The company page itself, big enough to read as real, filling the box. It fills
// in as each item on the checklist gets done.

const CANVAS = 720;

const Slot = ({
  label,
  height = 64,
}: {
  label: string;
  height?: number;
}): ReactElement => (
  <div
    className="flex items-center justify-center rounded-12 border border-dashed border-border-subtlest-secondary text-text-tertiary typo-footnote"
    style={{ height }}
  >
    {label}
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-2">
    <h3 className="font-bold text-text-tertiary typo-footnote">{title}</h3>
    {children}
  </section>
);

interface StartupsPagePreviewProps {
  squad: Squad;
  isTeam: boolean;
  product?: SquadProduct;
  cta?: string;
  hasSeats?: boolean;
}

export const StartupsPagePreview = ({
  squad,
  isTeam,
  product,
  cta,
  hasSeats,
}: StartupsPagePreviewProps): ReactElement => {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const links = [squad.website, ...(squad.links ?? [])].filter(
    (link): link is string => !!link,
  );

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return undefined;
    }

    const observer = new ResizeObserver(() =>
      setScale(Math.min(frame.clientWidth / CANVAS, 1.2)),
    );
    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      aria-hidden
      className="pointer-events-none relative h-full w-full overflow-hidden"
      style={{ minHeight: 480 }}
    >
      <div
        style={{
          width: CANVAS,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <SpotlightProvider>
          <SquadPageContextProvider squad={squad} isViewerReady>
            <SquadProfileHeader />
          </SquadPageContextProvider>
        </SpotlightProvider>
        <div className="flex flex-col gap-5 border-t border-border-subtlest-tertiary p-6">
          {isTeam && !cta && (
            <Slot label="A CTA on your page header" height={44} />
          )}
          <Section title="Links">
            {links.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {links.map((link) => (
                  <span
                    key={link}
                    className="flex items-center gap-1 rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 font-bold typo-footnote"
                  >
                    {link.replace(/^https?:\/\/(www\.)?/, '')}
                    <OpenLinkIcon size={IconSize.Size16} />
                  </span>
                ))}
              </div>
            ) : (
              <Slot label="Your site, docs, GitHub and changelog" height={44} />
            )}
          </Section>
          <Section title="Product">
            {product ? (
              <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3">
                {product.faviconUrl && (
                  <img
                    src={product.faviconUrl}
                    alt=""
                    className="size-12 shrink-0 rounded-12"
                  />
                )}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold typo-callout">
                    {product.title}
                  </span>
                  <span className="text-text-tertiary typo-footnote">
                    {product.tagline}
                  </span>
                </span>
              </div>
            ) : (
              <Slot label="A card with your tagline, pricing and link" />
            )}
          </Section>
          {isTeam && !hasSeats && (
            <Section title="Team">
              <Slot label="The people who run this page" height={44} />
            </Section>
          )}
          <Section title="Posts">
            <Slot label="Your first post lands here" height={160} />
          </Section>
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: 72,
          background:
            'linear-gradient(180deg, transparent, var(--theme-background-default))',
        }}
      />
    </div>
  );
};
