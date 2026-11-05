import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadProfileHeader } from '@dailydotdev/shared/src/features/squads/components/header/SquadProfileHeader';
import { squadMembersPreviewQueryOptions } from '@dailydotdev/shared/src/graphql/squads';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  OpenLinkIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks/useViewSize';
import { toSquadHandle } from '@dailydotdev/shared/src/features/squads/lib/handle';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';

// What fills the right side. The company step gets a small mock-up of where the
// name will appear. The last step gets the page itself, big enough to read as
// real, and it fills in as each item gets done.

const CANVAS = 720;
// The page header's full height at the canvas width.

const COVER = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="168"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A1B5E"/><stop offset=".55" stop-color="#5B2FB0"/><stop offset="1" stop-color="#14B8C4"/></linearGradient></defs><rect width="720" height="168" fill="url(#g)"/></svg>',
)}`;

export interface PageContent {
  name: string;
  description?: boolean;
  links?: boolean;
  product?: boolean;
  cta?: boolean;
  seats?: boolean;
  post?: boolean;
  plan?: SquadPlan;
}

const toSquad = ({ name, description, links }: PageContent): Squad =>
  ({
    id: 'preview',
    handle: toSquadHandle(name || 'your company'),
    name: name || 'Your company',
    image: name === 'Acme' ? '/squad-page/acme-logo.svg' : undefined,
    headerImage: description ? COVER : undefined,
    permalink: '',
    description: description ? 'The software factory for developer teams.' : '',
    website: links ? 'https://acme.dev' : undefined,
    type: SourceType.Squad,
    public: true,
    active: true,
    membersCount: 1,
    memberPostingRole: SourceMemberRole.Moderator,
    memberInviteRole: SourceMemberRole.Member,
    moderationRequired: false,
    moderationPostCount: 0,
    createdAt: new Date('2026-11-04'),
    rules: [],
    links: [],
    features: {},
  }) as unknown as Squad;

const useScale = (): {
  frameRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLDivElement>;
  scale: number;
  canvasHeight: number;
} => {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const [canvasHeight, setCanvasHeight] = useState(0);

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

  return { frameRef, canvasRef, scale, canvasHeight };
};

const Header = ({ content }: { content: PageContent }): ReactElement => {
  const client = useQueryClient();
  const squad = toSquad(content);

  client.setQueryData(squadMembersPreviewQueryOptions({ squad }).queryKey, []);

  return (
    <SquadPageContextProvider squad={squad} isViewerReady>
      <SquadProfileHeader />
    </SquadPageContextProvider>
  );
};

/** Where something will appear once it's added. */
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

const LINKS = ['Website', 'Docs', 'GitHub', 'Changelog'];

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

const SamplePost = ({ name }: { name: string }): ReactElement => (
  <article className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
    <p className="font-bold typo-title3">{`How we built ${name} for developers who ship fast`}</p>
    <div
      className="h-32 w-full rounded-12"
      style={{
        background: 'linear-gradient(135deg, #2A1B5E, #5B2FB0 60%, #14B8C4)',
      }}
    />
    <span className="flex items-center gap-1 text-text-tertiary typo-footnote">
      <UpvoteIcon size={IconSize.Size16} /> 48
    </span>
  </article>
);

/** The whole page, filling the box. */
export const FullPagePreview = ({
  content,
}: {
  content: PageContent;
}): ReactElement => {
  const { frameRef, canvasRef, scale, canvasHeight } = useScale();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { name, links, product, cta, seats, post, plan } = content;
  const isTeam = plan === SquadPlan.Team;

  return (
    <div
      ref={frameRef}
      aria-hidden
      className="startups-preview pointer-events-none relative h-full w-full overflow-hidden rounded-16"
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
        <Header content={content} />
        <div className="flex flex-col gap-5 border-t border-border-subtlest-tertiary p-6">
          {isTeam &&
            (cta ? (
              <span
                className="flex h-11 items-center justify-center rounded-12 font-bold typo-callout"
                style={{ background: '#fff', color: '#111827' }}
              >
                Start building for free
              </span>
            ) : (
              <Slot label="A CTA on your page header" height={44} />
            ))}
          <Section title="Links">
            {links ? (
              <div className="flex flex-wrap gap-2">
                {LINKS.map((link) => (
                  <span
                    key={link}
                    className="flex items-center gap-1 rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 typo-footnote"
                  >
                    {link}
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
              <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
                <span
                  className="size-12 shrink-0 rounded-12"
                  style={{
                    background: 'linear-gradient(135deg, #5B2FB0, #14B8C4)',
                  }}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-bold typo-callout">{`${name} Cloud`}</span>
                  <span className="text-text-tertiary typo-footnote">
                    Ship faster, with the tools your team knows.
                  </span>
                </span>
                <span className="font-bold typo-footnote">From $20</span>
              </div>
            ) : (
              <Slot label="A card with your tagline, pricing and link" />
            )}
          </Section>
          {isTeam && (
            <Section title="Team">
              {seats ? (
                <div className="flex gap-2">
                  {['#7C6BEA', '#29D8E5', '#F25D82', '#FF9157'].map((color) => (
                    <span
                      key={color}
                      className="size-10 rounded-12"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              ) : (
                <Slot label="The people who run this page" height={44} />
              )}
            </Section>
          )}
          <Section title="Posts">
            {post ? (
              <SamplePost name={name} />
            ) : (
              <Slot label="Your first post lands here" height={160} />
            )}
          </Section>
        </div>
      </div>
      {isLaptop && (
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: 72,
            background: 'linear-gradient(180deg, transparent, #141418)',
          }}
        />
      )}
    </div>
  );
};

/** The company step: the page's top, and where the name will show up. */
