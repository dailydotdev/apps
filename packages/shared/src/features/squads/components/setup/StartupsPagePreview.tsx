import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import type { Squad } from '../../../../graphql/sources';
import { OpenLinkIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../../components/ProfilePicture';
import { SpotlightProvider } from '../../../../components/spotlight/SpotlightContext';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../../../hooks/useViewSize';
import { squadSeatMembersQueryOptions } from '../../../../graphql/squadSubscription';
import { SquadPageContextProvider } from '../../SquadPageContext';
import { getSquadId } from '../../lib/features';
import { SquadProfileHeader } from '../header/SquadProfileHeader';
import type { SquadProduct } from '../../../../graphql/squadProducts';
import { squadProductPricingLabel } from '../../../../graphql/squadProducts';

// The company page itself, big enough to read as real, filling the box. It fills
// in as each item on the checklist gets done.

const CANVAS = 720;

const PREVIEW_STYLES = `
.startups-preview header button { visibility: hidden; }
.startups-stage-surface { --startups-stage: #141418; }
:root.light .startups-stage-surface { --startups-stage: var(--theme-background-default); }
@media (prefers-color-scheme: light) {
  :root.auto .startups-stage-surface { --startups-stage: var(--theme-background-default); }
}
@media (min-width: 1020px) {
  .startups-stage-surface { background: var(--startups-stage); }
}
`;

/** Paints what's in the right box in the stage's own colour on a desktop. */
export const StartupsStageSurface = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('startups-stage-surface', className)}>
    <style dangerouslySetInnerHTML={{ __html: PREVIEW_STYLES }} />
    {children}
  </div>
);

const Slot = ({
  label,
  height = 64,
}: {
  label: string;
  height?: number;
}): ReactElement => (
  <div
    className="flex items-center justify-center rounded-12 border border-dashed border-border-subtlest-secondary text-text-quaternary typo-footnote"
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

const SeatFaces = ({ squad }: { squad: Squad }): ReactElement => {
  const { user } = useAuthContext();
  const { data: members } = useQuery(
    squadSeatMembersQueryOptions({ user, sourceId: getSquadId(squad) }),
  );

  return (
    <div className="flex gap-2">
      {members
        ?.filter(({ seat }) => seat)
        .map((member) => (
          <ProfilePicture
            key={member.user.id}
            user={member.user}
            size={ProfileImageSize.Large}
          />
        ))}
    </div>
  );
};

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
  const isLaptop = useViewSize(ViewSize.Laptop);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const links = [squad.website, ...(squad.links ?? [])].filter(
    (link): link is string => !!link,
  );
  // A picture of the page as visitors will see it, without the owner's actions.
  const pageSquad = useMemo(
    () => ({ ...squad, currentMember: undefined }),
    [squad],
  );

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;

    if (!frame || !canvas) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      setScale(Math.min(frame.clientWidth / CANVAS, 1.2));
      setCanvasHeight(canvas.offsetHeight);
    });
    observer.observe(frame);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, []);

  return (
    <StartupsStageSurface
      className={classNames(
        'startups-preview pointer-events-none relative h-full w-full overflow-hidden',
        !isLaptop && 'rounded-16',
      )}
    >
      <div
        ref={frameRef}
        aria-hidden
        className="relative h-full w-full overflow-hidden"
        // A scaled page keeps its full size in the layout, so on a phone, where
        // nothing else sets the height, the frame takes the size it's drawn at.
        style={isLaptop ? { minHeight: 480 } : { height: canvasHeight * scale }}
      >
        <div
          ref={canvasRef}
          style={{
            width: CANVAS,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <SpotlightProvider>
            <SquadPageContextProvider squad={pageSquad} isViewerReady>
              <SquadProfileHeader />
            </SquadPageContextProvider>
          </SpotlightProvider>
          <div className="flex flex-col gap-5 border-t border-border-subtlest-tertiary p-6">
            {isTeam &&
              (cta ? (
                <span
                  className="flex h-11 items-center justify-center rounded-12 font-bold typo-callout"
                  style={{ background: '#fff', color: '#111827' }}
                >
                  {cta}
                </span>
              ) : (
                <Slot label="A CTA on your page header" height={44} />
              ))}
            <Section title="Links">
              {links.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {links.map((link) => (
                    <span
                      key={link}
                      className="flex items-center gap-1 rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 typo-footnote"
                    >
                      {link.replace(/^https?:\/\/(www\.)?/, '')}
                      <OpenLinkIcon size={IconSize.Size16} />
                    </span>
                  ))}
                </div>
              ) : (
                <Slot
                  label="Your site, docs, GitHub and changelog"
                  height={44}
                />
              )}
            </Section>
            <Section title="Product">
              {product ? (
                <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
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
                  {product.pricingModel && (
                    <span className="font-bold typo-footnote">
                      {squadProductPricingLabel[product.pricingModel]}
                    </span>
                  )}
                </div>
              ) : (
                <Slot label="A card with your tagline, pricing and link" />
              )}
            </Section>
            {isTeam && (
              <Section title="Team">
                {hasSeats ? (
                  <SeatFaces squad={squad} />
                ) : (
                  <Slot label="The people who run this page" height={44} />
                )}
              </Section>
            )}
            <Section title="Posts">
              <Slot label="Your first post lands here" height={160} />
            </Section>
          </div>
        </div>
        {isLaptop && (
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: 72,
              background:
                'linear-gradient(180deg, transparent, var(--startups-stage))',
            }}
          />
        )}
      </div>
    </StartupsStageSurface>
  );
};
