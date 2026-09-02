import React, { useState } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { fn } from 'storybook/test';
import { SnapshotButton } from '@dailydotdev/shared/src/components/imageShare/SnapshotButton';
import type { SnapshotMenuVariant } from '@dailydotdev/shared/src/components/imageShare/SnapshotButton';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { SnapshotFrame } from '@dailydotdev/shared/src/features/snapshot/SnapshotFrame';
import { SnapshotContent } from '@dailydotdev/shared/src/features/snapshot/SnapshotContent';
import {
  SnapshotImageSection,
  SnapshotImageTile,
} from '@dailydotdev/shared/src/components/imageShare/SnapshotImageSection';
import { SocialShareContainer } from '@dailydotdev/shared/src/components/widgets/SocialShareContainer';
import { SocialShareList } from '@dailydotdev/shared/src/components/widgets/SocialShareList';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { avatarUri } from './snapshotFixtures';

const POST_LINK = 'https://app.daily.dev/posts/why-iconic-tech-brands-lost';
const SHARE_TEXT =
  'Why iconic tech brands like HTC and LG lost their dominance';

const CARD = (
  <SnapshotFrame seed="menu-styles">
    <SnapshotContent
      avatar={{ src: avatarUri('#B14BD7', 'X'), name: 'XDA Developers' }}
      body="A brief retrospective on how once-dominant tech and smartphone brands declined, citing OnePlus's recent troubles, LG's exit from the mobile business, and HTC's fall from once outselling Apple in America to a niche VR-focused company."
      meta={['Aug 24, 2026', '1m read time', 'xda-developers.com']}
      title={SHARE_TEXT}
    />
  </SnapshotFrame>
);

interface Style {
  id: SnapshotMenuVariant;
  name: string;
  origin: string;
  what: string;
  tradeoff: string;
}

const STYLES: Style[] = [
  {
    id: 'rows',
    name: 'Rows',
    origin: 'The first version',
    what: 'Preview on top, then one row per action. The plainest reading of a share menu.',
    tradeoff:
      'Both actions are equally weighted, so nothing teaches which one is new. Tallest of the layouts.',
  },
  {
    id: 'rowsCentered',
    name: 'Rows, centred',
    origin: 'New',
    what: 'Preview on top, the image action centred under it, then a separator and a left-aligned Copy link.',
    tradeoff:
      'The separator sorts the two into “the new thing” and “the usual thing”, which the plain rows never do. But every other menu in the app is left-aligned, and centred rows with icons are harder to scan.',
  },
  {
    id: 'overlay',
    name: 'Overlay pill',
    origin: 'Current',
    what: 'Preview fills the menu with a white pill floating over its bottom centre; Copy link sits below.',
    tradeoff:
      'The image action is unmissable, but a white pill needs a dark card behind it — a light card would need a scrim.',
  },
  {
    id: 'compact',
    name: 'Compact',
    origin: 'New',
    what: 'No large preview. Two ordinary rows, the image one carrying a 24px thumbnail as its icon.',
    tradeoff:
      'Fastest and smallest, and it still hints at the image — but the card design never gets seen.',
  },
  {
    id: 'split',
    name: 'Tsahi’s split button',
    origin: 'From #6369',
    what: 'The trigger itself changes: left half copies the link on one press, the chevron drops the whole sheet — image section, squads and external tiles.',
    tradeoff:
      'The common action costs a single press and never opens anything. But the dropdown is now the modal in a popover, which is a lot to hang off a chevron.',
  },
];

const Swatch = ({
  style,
  onCapture,
}: {
  style: Style;
  onCapture: (blob: Blob) => void;
}) => (
  <section className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <header className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <h3 className="font-bold text-text-primary typo-body">{style.name}</h3>
        <span className="text-text-quaternary typo-caption1">
          {style.origin}
        </span>
      </div>
      <p className="text-text-tertiary typo-footnote">{style.what}</p>
      <p className="text-text-quaternary typo-caption1">{style.tradeoff}</p>
    </header>
    <div className="flex flex-wrap items-center gap-3 rounded-12 bg-background-default p-3">
      <SnapshotButton
        card={CARD}
        filename={`daily-${style.id}`}
        link={POST_LINK}
        menuVariant={style.id}
        onCapture={onCapture}
        shareText={SHARE_TEXT}
        squads={SQUADS.map((squad) => (
          <SquadTile key={squad.handle} {...squad} compact />
        ))}
      />
      {style.id !== 'split' && (
        <SnapshotButton
          card={CARD}
          filename={`daily-${style.id}`}
          link={POST_LINK}
          menuVariant={style.id}
          onCapture={onCapture}
          shareText={SHARE_TEXT}
          showLabel={false}
          variant={ButtonVariant.Float}
        />
      )}
    </div>
  </section>
);

/**
 * Real squads and sources from production, so the grid shows what the sheet
 * actually looks like. Every URL checked for a 200 before it went in here.
 */
const SQUADS = [
  {
    handle: '@webdev',
    image:
      'https://media.daily.dev/image/upload/s--3B1fh4kU--/f_auto,q_auto/v1/squads/94fc7a56-e6d2-403f-acd6-b988b426574f',
  },
  {
    handle: '@nextjs',
    image:
      'https://media.daily.dev/image/upload/s--ai0kromH--/f_auto,q_auto/v1698518496/squads/69088f45-3a20-4730-81c2-32d0d75fb8c6',
  },
  {
    handle: '@phpdev',
    image:
      'https://media.daily.dev/image/upload/s--X4-DzKOE--/f_auto,q_auto/v1698161550/squads/817bc9b5-113e-481c-9b35-2f1aa6b23576',
  },
  {
    handle: '@uxui',
    image:
      'https://media.daily.dev/image/upload/s--M-6mwD5z--/f_auto/v1727751069/squads/d119e55c-104b-44c0-b8f8-8355bec565df',
  },
  {
    handle: '@coffee',
    image:
      'https://media.daily.dev/image/upload/s--uttMfVq6--/f_auto/v1705311436/squads/40b925cf-9602-406b-b15f-21015c870024',
  },
  {
    handle: '@deepflutter',
    image:
      'https://media.daily.dev/image/upload/s--iu6AJHXW--/f_auto/v1719044745/squads/eafd8fd0-425a-47e3-b675-fff42bf0b478',
  },
  {
    handle: '@lpython',
    image:
      'https://media.daily.dev/image/upload/s--CBrg8cfW--/f_auto/v1724849342/squads/974527e9-1cc8-470b-a572-91ce0ebc643f',
  },
  {
    handle: '@ai',
    image:
      'https://media.daily.dev/image/upload/s--0Nnn3lEU--/f_auto,q_auto/v1/squads/a6581605-a03b-4877-84f2-7d362a8ada28',
  },
  {
    handle: '@devops',
    image:
      'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/db8f2265cff0416c878c6e7e92bb8715',
  },
  {
    handle: '@rust',
    image:
      'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/8fb725c4025846578f65c8eada2fc5b8',
  },
  {
    handle: '@golang',
    image:
      'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/f416aeab0a1f4b9faa22d93768c97905',
  },
  {
    handle: '@flutter',
    image:
      'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/flutter',
  },
];

const SquadTile = ({
  handle,
  image,
  compact,
}: (typeof SQUADS)[number] & { compact?: boolean }) => (
  <div
    className={classNames(
      'flex flex-col items-center',
      compact ? 'w-14' : 'w-16',
    )}
  >
    <img
      src={image}
      alt=""
      className={classNames(
        'rounded-full bg-surface-float object-cover',
        compact ? 'size-10' : 'size-12',
      )}
    />
    <span className="mt-1.5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-text-tertiary typo-caption2">
      {handle}
    </span>
  </div>
);

/**
 * Mirrors ShareModal's chrome without pulling in react-modal's portal. The
 * body scrolls inside a 640px cap, so the sheet never grows with its content.
 */
const ModalFrame = ({
  label,
  note,
  width = 'w-[26rem]',
  maxHeight = 'max-h-[40rem]',
  bodyClassName = 'flex flex-col gap-6 overflow-y-auto p-6',
  children,
}: {
  label: string;
  note: string;
  width?: string;
  maxHeight?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) => {
  const [frame, setFrame] = useState<number>();
  const [content, setContent] = useState<number>();

  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <figcaption className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <h3 className="font-bold text-text-primary typo-body">{label}</h3>
          {frame ? (
            <span className="text-text-quaternary typo-caption1">
              {frame}px tall
              {content && content > frame
                ? ` · ${content}px of content`
                : ' · no scroll'}
            </span>
          ) : null}
        </div>
        <p className="text-text-tertiary typo-footnote">{note}</p>
      </figcaption>
      <div
        ref={(node) => {
          if (node) {
            setFrame(Math.round(node.offsetHeight));
          }
        }}
        className={classNames(
          'flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-popover',
          maxHeight,
          width,
        )}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-border-subtlest-tertiary px-6 py-4">
          <h2 className="font-bold text-text-primary typo-title3">
            Share post
          </h2>
          <CloseButton size={ButtonSize.Small} />
        </header>
        <div
          ref={(node) => {
            if (node) {
              setContent(Math.round(node.scrollHeight));
            }
          }}
          className={classNames('min-h-0 flex-1', bodyClassName)}
        >
          {children}
        </div>
      </div>
    </figure>
  );
};

const Squads = () => (
  <SocialShareContainer title="Share with your squad">
    {SQUADS.map((squad) => (
      <SquadTile key={squad.handle} {...squad} />
    ))}
  </SocialShareContainer>
);

const External = ({ children }: { children?: React.ReactNode }) => (
  <SocialShareContainer title="Share externally">
    {children}
    <SocialShareList
      link={POST_LINK}
      description={SHARE_TEXT}
      onClickSocial={() => undefined}
      onCopy={() => undefined}
      onNativeShare={() => undefined}
      shortenUrl={false}
    />
  </SocialShareContainer>
);

const MenuStyles = () => {
  const [capture, setCapture] = useState<string | null>(null);
  const onCapture = React.useCallback((blob: Blob) => {
    setCapture(URL.createObjectURL(blob));
  }, []);

  return (
    <div className="flex flex-col gap-8 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-bold text-text-primary typo-mega3">
          Share menu styles
        </h1>
        <p className="max-w-[46rem] text-text-tertiary typo-body">
          Every candidate for the Share control, live against the same post
          card: five dropdown layouts, then the two ways the image can sit in
          the share modal. Press any of them — the render appears in the panel
          at the bottom. Pick one and the rest, plus the{' '}
          <code className="text-text-primary">menuVariant</code> prop, come out.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-text-primary typo-title3">
          Trigger sizes
        </h2>
        <p className="text-text-tertiary typo-footnote">
          The winning style has to hold up icon-only and at XSmall, where it
          lives in leaderboard rows and on achievement cards.
        </p>
        <div className="flex flex-wrap items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
          {[ButtonSize.Medium, ButtonSize.Small, ButtonSize.XSmall].map(
            (size) => (
              <SnapshotButton
                key={size}
                card={CARD}
                filename="daily-size"
                link={POST_LINK}
                onCapture={onCapture}
                shareText={SHARE_TEXT}
                showLabel={false}
                size={size}
                variant={ButtonVariant.Float}
              />
            ),
          )}
          <SnapshotButton
            card={CARD}
            filename="daily-size"
            link={POST_LINK}
            onCapture={onCapture}
            shareText={SHARE_TEXT}
            variant={ButtonVariant.Secondary}
          />
        </div>
      </div>

      <div className="grid gap-4 laptop:grid-cols-2">
        {STYLES.map((style) => (
          <Swatch key={style.id} onCapture={onCapture} style={style} />
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2 className="font-bold text-text-primary typo-title3">
            In the share modal
          </h2>
          <p className="max-w-[46rem] text-text-tertiary typo-footnote">
            The same question one surface up. Neither is a mode: squads and the
            external tiles keep sharing the link, and the image owns its own
            action. Only the room it gets differs — and with it, whether anyone
            finds it.
          </p>
        </header>
        <div className="flex flex-wrap items-start gap-8">
          <ModalFrame
            label="F · Modal, its own section"
            note="A 96px thumbnail and one action above the squads. Costs height; explains itself on open."
          >
            <SnapshotImageSection card={CARD} onCapture={onCapture} />
            <Squads />
            <External />
          </ModalFrame>

          <ModalFrame
            bodyClassName="flex gap-6 overflow-hidden p-6"
            label="H · Modal, horizontal"
            maxHeight="max-h-[26rem]"
            note="Left third is the card and its action, pinned; the right two thirds scroll through every destination."
            width="w-[44rem]"
          >
            <div className="w-1/3 shrink-0">
              <SnapshotImageSection
                card={CARD}
                compact
                onCapture={onCapture}
                stacked
              />
            </div>
            {/* Only the destinations scroll — the card and its button stay put. */}
            <div className="flex min-h-0 w-2/3 flex-col gap-6 overflow-y-auto">
              <Squads />
              <External />
            </div>
          </ModalFrame>

          <ModalFrame
            label="G · Modal, one tile"
            note="An Image tile leading Share externally. Costs no height and changes nothing — and teaches nobody it exists."
          >
            <Squads />
            <External>
              <SnapshotImageTile card={CARD} onCapture={onCapture} />
            </External>
          </ModalFrame>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-text-primary typo-title3">Last render</h2>
        {capture ? (
          <img
            src={capture}
            alt="Rendered share card"
            className="w-full max-w-[26rem] rounded-12 border border-border-subtlest-tertiary"
          />
        ) : (
          <p className="text-text-quaternary typo-callout">
            Open any menu to render the card here.
          </p>
        )}
      </section>
    </div>
  );
};

const meta: Meta<typeof MenuStyles> = {
  title: 'Features/Snapshot/Menu styles',
  component: MenuStyles,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        {/* The social tiles read the short-URL hook, which needs auth context. */}
        <AuthContextProvider
          updateUser={fn()}
          tokenRefreshed
          getRedirectUri={fn()}
          loadingUser={false}
          loadedUserFromCache
          refetchBoot={fn()}
          squads={[]}
          isAndroidApp={false}
        >
          <Story />
          {/* Mounted so the copy-image and copy-link toasts are visible here. */}
          <Toast autoDismissNotifications />
        </AuthContextProvider>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

export const AllStyles: StoryObj<typeof MenuStyles> = {};
