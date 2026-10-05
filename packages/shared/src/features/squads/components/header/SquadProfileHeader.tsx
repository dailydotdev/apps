import type { ReactElement, ReactNode } from 'react';
import React, { useRef } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import type { Squad } from '../../../../graphql/sources';
import { squadMembersPreviewQueryOptions } from '../../../../graphql/squads';
import { SquadImage } from '../../../../components/squads/SquadImage';
import {
  EarthIcon,
  LinkIcon,
  LockIcon,
  SourceIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../../components/ProfilePicture';
import Link from '../../../../components/utilities/Link';
import { largeNumberFormat } from '../../../../lib/numberFormat';
import { formatMonthYearOnly } from '../../../../lib/dateFormat';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useSquadPageContext } from '../../SquadPageContext';
import { getSquadId, hasSquadFeature } from '../../lib/features';
import { getDisplayUrl, squadLinkRel } from '../../lib/links';
import { SquadViewer } from '../../lib/viewer';
import { getSquadMembersUrl } from '../../lib/routes';
import { VerifiedSquadBadge } from '../VerifiedSquad';
import {
  SquadActions,
  SquadBlockActions,
  SquadPhoneActions,
} from './SquadActions';
import { ShellPage } from '../../../../components/shell/ShellPageContext';
import { useIsPhone } from '../../../../hooks/useViewSize';
import { usePassedBlock } from '../../../../components/shell/usePassedBlock';
import { shellCoverScrim } from '../../../../styles/custom';

const MAX_FACES = 3;

const getPrivacy = (squad: Squad): { icon: ReactNode; label: string } => {
  if (squad.flags?.featured) {
    return {
      icon: <SourceIcon size={IconSize.XSmall} secondary />,
      label: 'Featured',
    };
  }

  if (squad.public) {
    return { icon: <EarthIcon size={IconSize.XSmall} />, label: 'Public' };
  }

  return { icon: <LockIcon size={IconSize.XSmall} />, label: 'Private' };
};

interface MetaEntry {
  key: string;
  node: ReactNode;
  className?: string;
}

const SquadMetaLine = ({ squad }: { squad: Squad }): ReactElement => {
  const { website, category, createdAt } = squad;
  const privacy = getPrivacy(squad);
  const entries: MetaEntry[] = [];

  if (hasSquadFeature(squad, 'links') && website) {
    entries.push({
      key: 'website',
      node: (
        <a
          href={website}
          target="_blank"
          rel={squadLinkRel}
          className="flex items-center gap-1.5 text-text-secondary hover:underline"
        >
          <LinkIcon size={IconSize.Size16} />
          {getDisplayUrl(website)}
        </a>
      ),
    });
  }

  if (squad.flags?.featured || !squad.public) {
    entries.push({
      key: 'privacy',
      node: (
        <span
          className={classNames(
            'flex items-center gap-1',
            squad.flags?.featured && 'font-bold text-accent-cabbage-default',
          )}
        >
          {privacy.icon}
          {privacy.label} Squad
        </span>
      ),
    });
  }

  if (squad.public && category) {
    entries.push({
      key: 'category',
      node: (
        <a
          href={`/squads/discover/${category.slug}`}
          className="text-text-link hover:underline"
          title={`View all Squads in ${category.title}`}
        >
          {category.title}
        </a>
      ),
    });
  }

  if (createdAt) {
    entries.push({
      key: 'since',
      node: `Since ${formatMonthYearOnly(createdAt)}`,
      className: 'hidden tablet:flex',
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-text-tertiary typo-footnote">
      {entries.map(({ key, node, className }, index) => (
        <span
          key={key}
          className={classNames(
            'flex items-center gap-2 whitespace-nowrap',
            className,
          )}
        >
          {index > 0 && (
            <span aria-hidden className="text-text-quaternary">
              ·
            </span>
          )}
          {node}
        </span>
      ))}
    </div>
  );
};

const Stat = ({ amount, label }: { amount: number; label: string }) => (
  <span className="flex items-baseline gap-1">
    <strong className="tabular-nums text-text-primary typo-callout">
      {largeNumberFormat(amount) ?? 0}
    </strong>
    <span className="text-text-tertiary typo-footnote">{label}</span>
  </span>
);

const SquadStats = ({ squad }: { squad: Squad }): ReactElement => {
  const { openModal } = useLazyModal();
  const { isFetched: isBootFetched } = useAuthContext();
  const { data: members } = useQuery(
    squadMembersPreviewQueryOptions({ squad, enabled: isBootFetched }),
  );
  const awards = squad.flags?.totalAwards ?? 0;
  const membersUrl = getSquadMembersUrl(squad.handle);
  // Placeholders hold the facepile's width until the members load
  const faces = Math.min(members?.length ?? squad.membersCount ?? 0, MAX_FACES);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-subtlest-tertiary pt-4">
      <Link href={membersUrl} passHref>
        <a
          href={membersUrl}
          aria-label={`View ${squad.membersCount} squad members`}
          className="flex items-center gap-2 hover:opacity-64"
        >
          {faces > 0 && (
            <span className="flex">
              {members?.length
                ? members
                    .slice(0, MAX_FACES)
                    .map(({ user }, index) => (
                      <ProfilePicture
                        key={user.id}
                        user={user}
                        size={ProfileImageSize.XSmall}
                        className={classNames(
                          'ring-2 ring-background-default',
                          index > 0 && '-ml-1.5',
                        )}
                      />
                    ))
                : Array.from({ length: faces }, (_, index) => (
                    <span
                      key={index}
                      className={classNames(
                        'size-5 rounded-6 bg-surface-float ring-2 ring-background-default',
                        index > 0 && '-ml-1.5',
                      )}
                    />
                  ))}
            </span>
          )}
          <Stat amount={squad.membersCount} label="Members" />
        </a>
      </Link>
      <Stat amount={squad.flags?.totalPosts ?? 0} label="Posts" />
      <Stat amount={squad.flags?.totalViews ?? 0} label="Views" />
      <Stat amount={squad.flags?.totalUpvotes ?? 0} label="Upvotes" />
      {awards > 0 && (
        <button
          type="button"
          className="hover:opacity-64"
          onClick={() =>
            openModal({
              type: LazyModal.ListAwards,
              props: { queryProps: { id: getSquadId(squad), type: 'SQUAD' } },
            })
          }
        >
          <Stat amount={awards} label="Awards" />
        </button>
      )}
    </div>
  );
};

export const SquadProfileHeader = (): ReactElement => {
  const { squad, viewer, isViewerReady } = useSquadPageContext();
  const isPhone = useIsPhone();
  const coverRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const hasCoverPassed = usePassedBlock(coverRef, isPhone);
  const hasNamePassed = usePassedBlock(nameRef, isPhone);
  const hasHeroPassed = usePassedBlock(heroRef, isPhone);

  return (
    <header ref={heroRef} className="relative w-full">
      {/* On a phone the cover runs up behind the block, which floats its
          squares over it until the cover has scrolled away. */}
      <div
        ref={coverRef}
        className="shell-cover relative -mt-[var(--shell-top,var(--shell-top-rest,0px))] h-[10.5rem] overflow-hidden bg-surface-float tablet:mt-0 tablet:h-36 laptop:rounded-t-16"
      >
        {squad.headerImage && (
          <img
            src={squad.headerImage}
            alt={`${squad.name} cover`}
            className="size-full object-cover"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-24 tablet:hidden"
          style={{ background: shellCoverScrim }}
        />
      </div>
      <div className="flex flex-col px-4 pb-5 tablet:px-6">
        <div className="-mt-8 flex items-end justify-between gap-4 tablet:-mt-12">
          <SquadImage
            {...squad}
            className="relative size-20 shrink-0 bg-background-default ring-4 ring-background-default tablet:size-26"
          />
          {isViewerReady && <SquadActions />}
          {isViewerReady && isPhone && (
            <ShellPage
              title={hasNamePassed ? squad.name : undefined}
              titleFades
              transparent={!hasCoverPassed}
              actions={<SquadBlockActions showsJoin={hasHeroPassed} />}
            />
          )}
        </div>
        {viewer === SquadViewer.Blocked && (
          <div className="mt-4 flex items-center gap-2 rounded-12 bg-surface-float px-3 py-2 text-text-tertiary typo-footnote">
            <LockIcon size={IconSize.Small} className="shrink-0" />
            You no longer have access to this Squad. Contact a moderator if you
            think this is a mistake.
          </div>
        )}
        <div className="mt-4 flex flex-col gap-1">
          <h1
            ref={nameRef}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 font-bold text-text-primary typo-title2"
          >
            {squad.name}
            {hasSquadFeature(squad, 'verified') && (
              <VerifiedSquadBadge className="size-5" />
            )}
          </h1>
          {!!squad.description && (
            <p className="text-text-secondary typo-body">{squad.description}</p>
          )}
        </div>
        <SquadMetaLine squad={squad} />
        <SquadStats squad={squad} />
        <SquadPhoneActions />
      </div>
    </header>
  );
};
