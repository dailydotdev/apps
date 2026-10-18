import type { ReactElement } from 'react';
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { SquadPerk } from '../../../../graphql/squadJobsPerks';
import {
  isSquadItemGone,
  SquadPerkCodeKind,
  squadPerkQueryOptions,
} from '../../../../graphql/squadJobsPerks';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CopyIcon,
  LockIcon,
  OpenLinkIcon,
  TimerIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { SquadActionButton } from '@dailydotdev/shared/src/components/squads/SquadActionButton';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useCopyText } from '@dailydotdev/shared/src/hooks/useCopy';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { ParkedLogEvent } from '../../../../lib/log';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { useSquadPageContext } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import {
  useSquadPerkMutations,
  useSquadPerks,
} from '../../hooks/useSquadPerks';
import { getLinkHost, getSquadPerkEndsLabel } from '../../lib/jobsPerks';
import { isJoinedViewer } from '@dailydotdev/shared/src/features/squads/lib/viewer';
import {
  getSquadPerkUrl,
  getSquadTabUrl,
  SquadPageTab,
} from '../../lib/routes';
import { SquadPageLayout } from '../SquadPageLayout';
import { SquadSubPageHeader } from '@dailydotdev/shared/src/features/squads/components/SquadSubPageHeader';
import { VerifiedSquadBadge } from '@dailydotdev/shared/src/features/squads/components/VerifiedSquad';
import {
  SquadDetailBullets,
  SquadDetailFacts,
  SquadDetailSection,
  SquadDetailUnavailable,
} from '../jobs/SquadDetail';

// Member perks: shop-style cards anyone can see, locked for visitors, and
// a page per perk where members get their code.

const PerkLogo = ({
  perk,
  className,
}: {
  perk: Pick<SquadPerk, 'image'>;
  className: string;
}): ReactElement => {
  const { squad } = useSquadPageContext();

  return (
    <Image
      src={perk.image ?? squad.image}
      fallbackSrc={squad.image}
      alt=""
      type={ImageType.Squad}
      className={`shrink-0 rounded-14 object-cover ${className}`}
    />
  );
};

const claimedLabel = (perk: Pick<SquadPerk, 'claimed'>): string =>
  `${largeNumberFormat(perk.claimed) ?? 0} claimed`;

export const SquadPerkCard = ({ perk }: { perk: SquadPerk }): ReactElement => {
  const { squad, viewer } = useSquadPageContext();
  const isMember = isJoinedViewer(viewer);
  const href = getSquadPerkUrl(squad.handle, perk.id);

  return (
    <li>
      <Link href={href} passHref>
        <a
          href={href}
          className="group flex h-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle hover:border-border-subtlest-secondary"
        >
          <span className="relative flex h-28 items-center justify-center bg-surface-float">
            <PerkLogo
              perk={perk}
              className="size-14 transition-transform group-hover:scale-105"
            />
            <span className="absolute left-3 top-3 rounded-8 bg-background-default px-2 py-0.5 font-bold typo-caption1">
              {perk.value}
            </span>
            <span
              aria-label={isMember ? 'Unlocked' : 'Members only'}
              className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-background-default text-text-tertiary"
            >
              {isMember ? (
                <VIcon
                  size={IconSize.Size16}
                  className="text-accent-avocado-default"
                />
              ) : (
                <LockIcon size={IconSize.Size16} />
              )}
            </span>
          </span>
          <span className="flex flex-1 flex-col gap-1 p-4">
            <Typography
              type={TypographyType.Callout}
              bold
              className="group-hover:underline"
            >
              {perk.title}
            </Typography>
            {!!perk.summary && (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="line-clamp-2"
              >
                {perk.summary}
              </Typography>
            )}
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="mt-auto pt-2"
            >
              {`${getSquadPerkEndsLabel(perk)} · ${claimedLabel(perk)}`}
            </Typography>
          </span>
        </a>
      </Link>
    </li>
  );
};

/** The Perks tab on the squad page. */
export const SquadPerksTab = (): ReactElement => {
  const { squad, viewer } = useSquadPageContext();
  const { perks, isPending } = useSquadPerks(squad);
  const isMember = isJoinedViewer(viewer);

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-4 tablet:px-6 tablet:pt-6">
      <div className="flex flex-col gap-1">
        <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
          {`Member perks from ${squad.name}`}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {isMember
            ? 'You’re a member: open a perk to get your code.'
            : 'Join the squad to unlock them. One code per member.'}
        </Typography>
      </div>
      {!isPending && !perks.length && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          No perks right now.
        </Typography>
      )}
      <ul className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        {perks.map((perk) => (
          <SquadPerkCard key={perk.id} perk={perk} />
        ))}
      </ul>
    </div>
  );
};

/** The member's code with Copy; copying counts the claim once. */
const CodeBox = ({
  perk,
  onCopy,
}: {
  perk: SquadPerk;
  onCopy: () => void;
}): ReactElement => {
  const [copied, copy] = useCopyText(perk.code ?? undefined);

  return (
    <span className="flex items-center gap-2 rounded-12 border border-dashed border-border-subtlest-secondary bg-surface-float py-1 pl-4 pr-1">
      <span className="font-mono font-bold tracking-wide typo-callout">
        {perk.code}
      </span>
      <Button
        type="button"
        variant={copied ? ButtonVariant.Subtle : ButtonVariant.Primary}
        size={ButtonSize.Small}
        icon={copied ? <VIcon /> : <CopyIcon />}
        onClick={() => {
          copy();
          onCopy();
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </span>
  );
};

const PerkActions = ({ perk }: { perk: SquadPerk }): ReactElement => {
  const { squad, viewer } = useSquadPageContext();
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { logEvent } = useLogContext();
  const { onClaim, isClaiming } = useSquadPerkMutations(squad);
  const isMember = isJoinedViewer(viewer);
  const redeemHost = perk.redeemUrl ? getLinkHost(perk.redeemUrl) : null;

  if (!isMember) {
    return (
      <SquadActionButton
        alwaysShow
        squad={squad}
        origin={Origin.SquadPage}
        size={ButtonSize.Small}
        copy={{ join: `Join ${squad.name} to unlock` }}
        // The code comes with membership, so ask for the perk again
        onSuccess={() =>
          client.invalidateQueries({
            queryKey: squadPerkQueryOptions({ id: perk.id, user }).queryKey,
          })
        }
      />
    );
  }

  const claim = async () => {
    if (perk.claimedByMe) {
      return;
    }

    try {
      const claimed = await onClaim(perk.id);
      // Only a claim the API took counts, once
      if (claimed.claimedByMe) {
        logEvent({
          event_name: ParkedLogEvent.ClaimSquadPerk,
          target_id: perk.id,
          extra: JSON.stringify({ sourceId: squad.id }),
        });
      }
    } catch {
      // The hook shows why (ended, every code taken)
    }
  };

  const canTake = perk.claimedByMe || perk.isClaimable;

  if (!canTake) {
    return (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        Every code has been claimed, or the perk has ended.
      </Typography>
    );
  }

  return (
    <>
      {perk.code ? (
        <CodeBox perk={perk} onCopy={() => claim()} />
      ) : (
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          loading={isClaiming}
          disabled={isClaiming || perk.codeKind !== SquadPerkCodeKind.Unique}
          onClick={claim}
        >
          Get your code
        </Button>
      )}
      {perk.redeemUrl && (
        <Button
          tag="a"
          href={perk.redeemUrl}
          target="_blank"
          rel="noopener nofollow"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<OpenLinkIcon />}
          iconPosition={ButtonIconPosition.Right}
          onClick={() =>
            logEvent({
              event_name: ParkedLogEvent.ClickSquadPerkRedeem,
              target_id: perk.id,
              extra: JSON.stringify({ sourceId: squad.id }),
            })
          }
        >
          {redeemHost ? `Redeem on ${redeemHost}` : 'Redeem'}
        </Button>
      )}
    </>
  );
};

/** A perk's own page, a squad sub-page like Products or Members. */
export const SquadPerkPage = ({ perkId }: { perkId: string }): ReactElement => {
  const { squad } = useSquadPageContext();
  const { user } = useAuthContext();
  const { data, error, isError, refetch } = useQuery(
    squadPerkQueryOptions({ id: perkId, user }),
  );
  // A perk of another squad in this squad's address is not this page's
  const isOtherSquad = !!data && data.sourceId !== squad.id;
  const perk = isOtherSquad ? undefined : data;
  const isGone = isOtherSquad || (isError && isSquadItemGone(error));
  const { perks } = useSquadPerks(squad);
  const more = perks.filter(({ id }) => id !== perkId).slice(0, 4);
  let title = '';
  if (perk) {
    title = perk.title;
  } else if (isGone) {
    title = 'Perk not found';
  }

  return (
    <SquadPageLayout
      header={
        <SquadSubPageHeader
          title={title}
          backUrl={getSquadTabUrl(squad.handle, SquadPageTab.Perks)}
          backLabel="Back to Perks"
        />
      }
    >
      <div className="flex flex-col gap-10 px-4 pb-10 pt-6 tablet:px-6">
        {!perk && (isGone || isError) && (
          <SquadDetailUnavailable
            isGone={isGone}
            goneText="This perk is no longer offered."
            onRetry={() => refetch()}
          />
        )}
        {perk && (
          <>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <PerkLogo perk={perk} className="size-14" />
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-1">
                    <Typography type={TypographyType.Callout} bold truncate>
                      {squad.name}
                    </Typography>
                    <VerifiedSquadBadge />
                  </span>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {perk.toolTitle
                      ? `Member perk · ${perk.toolTitle}`
                      : 'Member perk'}
                  </Typography>
                </span>
              </div>
              {!!perk.summary && (
                <Typography
                  type={TypographyType.Body}
                  color={TypographyColor.Secondary}
                  className="text-pretty"
                >
                  {perk.summary}
                </Typography>
              )}
              <SquadDetailFacts
                facts={[
                  perk.value,
                  getSquadPerkEndsLabel(perk),
                  claimedLabel(perk),
                ]}
              />
              <div className="flex flex-wrap items-center gap-2">
                <PerkActions perk={perk} />
              </div>
            </div>
            {!!perk.steps.length && (
              <SquadDetailSection title="How to redeem">
                <ol className="flex flex-col gap-3">
                  {perk.steps.map((step, index) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-float font-bold tabular-nums typo-footnote">
                        {index + 1}
                      </span>
                      <Typography
                        type={TypographyType.Callout}
                        color={TypographyColor.Secondary}
                      >
                        {step}
                      </Typography>
                    </li>
                  ))}
                </ol>
              </SquadDetailSection>
            )}
            <SquadDetailSection title="Fine print">
              {!!perk.terms.length && <SquadDetailBullets items={perk.terms} />}
              <span className="flex items-center gap-2 text-text-tertiary typo-footnote">
                <TimerIcon size={IconSize.Size16} />
                {`Offered by ${
                  squad.name
                }, not daily.dev. ${getSquadPerkEndsLabel(perk)}.`}
              </span>
            </SquadDetailSection>
            {!!more.length && (
              <SquadDetailSection title={`More perks from ${squad.name}`}>
                <ul className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                  {more.map((item) => (
                    <SquadPerkCard key={item.id} perk={item} />
                  ))}
                </ul>
              </SquadDetailSection>
            )}
          </>
        )}
      </div>
    </SquadPageLayout>
  );
};
