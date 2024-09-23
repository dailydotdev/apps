import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { SourceMember, SourcePermissions, Squad } from '../../graphql/sources';
import { SquadHeaderBar } from './SquadHeaderBar';
import { SquadImage } from './SquadImage';
import EnableNotification from '../notifications/EnableNotification';
import { FlexCentered, FlexCol } from '../utilities';
import SharePostBar from './SharePostBar';
import { TourScreenIndex } from './SquadTour';
import { useSquadTour } from '../../hooks/useSquadTour';
import { verifyPermission } from '../../graphql/squads';
import { NotificationPromptSource } from '../../lib/log';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { ActionType } from '../../graphql/actions';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';
import classed from '../../lib/classed';
import ConditionalWrapper from '../ConditionalWrapper';
import { link } from '../../lib/links';
import SquadChecklistCard from '../checklist/SquadChecklistCard';
import { Separator } from '../cards/common';
import { PrivilegedMemberItem } from './Members/PrivilegedMemberItem';
import { formatMonthYearOnly } from '../../lib/dateFormat';
import {
  MAX_VISIBLE_PRIVILEGED_MEMBERS_LAPTOP,
  MAX_VISIBLE_PRIVILEGED_MEMBERS_MOBILE,
} from '../../lib/config';
import { useViewSize, ViewSize } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { SquadStat } from './common/SquadStat';
import { SquadPrivacyState } from './common/SquadPrivacyState';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface SquadPageHeaderProps {
  squad: Squad;
  members: SourceMember[];
  shouldUseListMode: boolean;
}

const MAX_WIDTH = 'laptopL:max-w-[38.5rem]';
const Divider = classed('span', 'flex flex-1 h-px bg-border-subtlest-tertiary');

export function SquadPageHeader({
  squad,
  members,
  shouldUseListMode,
}: SquadPageHeaderProps): ReactElement {
  const { tourIndex } = useSquadTour();
  const { openModal } = useLazyModal();
  const { openStep, isChecklistVisible } = useSquadChecklist({ squad });
  const allowedToPost = verifyPermission(squad, SourcePermissions.Post);
  const { category } = squad;
  const shouldShowHighlightPulse =
    tourIndex === TourScreenIndex.Post ||
    (isChecklistVisible && openStep === ActionType.SquadFirstPost);
  const isSquadMember = !!squad.currentMember;

  const createdAt = squad.createdAt
    ? formatMonthYearOnly(squad.createdAt)
    : null;
  const privilegedLength = squad.privilegedMembers?.length || 0;
  const isMobile = useViewSize(ViewSize.MobileL);
  const listMax = isMobile
    ? MAX_VISIBLE_PRIVILEGED_MEMBERS_MOBILE
    : MAX_VISIBLE_PRIVILEGED_MEMBERS_LAPTOP;

  return (
    <FlexCol
      className={classNames(
        'relative min-h-20 w-full items-center border-border-subtlest-tertiary px-6 tablet:mb-6 tablet:border-b tablet:pb-20',
        !shouldUseListMode && 'laptopL:items-start laptopL:px-18 laptopL:pb-14',
      )}
    >
      {isChecklistVisible && <SquadChecklistCard squad={squad} />}
      <div
        className={classNames(
          !shouldUseListMode && 'laptopL:flex-row',
          'flex flex-col items-center',
        )}
      >
        <SquadImage className="h-16 w-16 tablet:h-24 tablet:w-24" {...squad} />
        <FlexCol
          className={classNames(
            'mt-4',
            !shouldUseListMode && 'laptopL:ml-6 laptopL:mt-0',
          )}
        >
          <Typography
            tag={TypographyTag.H1}
            bold
            type={TypographyType.Title2}
            className={classNames(
              'text-center',
              !shouldUseListMode && 'laptopL:text-left',
            )}
          >
            {squad.name}
          </Typography>
          <div
            className={classNames(
              'mt-1 flex flex-row items-center justify-center text-text-quaternary typo-subhead tablet:mt-1',
              !shouldUseListMode && 'laptopL:justify-start',
            )}
          >
            <Typography
              tag={TypographyTag.H2}
              color={TypographyColor.Tertiary}
              className={classNames(
                'text-center',
                !shouldUseListMode && 'laptopL:text-left',
              )}
            >
              @{squad.handle}
            </Typography>
            {createdAt && (
              <>
                <Separator />
                <span>Created {createdAt}</span>
              </>
            )}
            {!!category && (
              <>
                <Separator />
                <a
                  aria-label={`View all squads in ${category.title}`}
                  className="text-text-link"
                  href={`/squads/discover/${category.id}`}
                  title={`View all squads in ${category.title}`}
                >
                  {category.title}
                </a>
              </>
            )}
          </div>
          <div className="mt-4 flex flex-col items-center gap-2 tablet:flex-row">
            <SquadPrivacyState
              isPublic={squad?.public}
              isFeatured={squad?.flags?.featured}
            />
            <ConditionalWrapper
              condition={isMobile}
              wrapper={(component) => (
                <div className="flex flex-row gap-2">{component}</div>
              )}
            >
              <SquadStat count={squad.flags?.totalPosts} label="Posts" />
              <SquadStat count={squad.flags?.totalViews} label="Views" />
              <SquadStat count={squad.flags?.totalUpvotes} label="Upvotes" />
            </ConditionalWrapper>
          </div>
        </FlexCol>
      </div>
      {squad.description && (
        <Typography
          tag={TypographyTag.P}
          color={TypographyColor.Secondary}
          type={TypographyType.Callout}
          className={classNames(
            'mt-5 w-full text-center',
            !shouldUseListMode && 'laptopL:text-left',
            !shouldUseListMode && MAX_WIDTH,
          )}
        >
          {squad.description}
        </Typography>
      )}
      <SquadHeaderBar squad={squad} members={members} className="mt-5" />
      <Typography
        bold
        className="mt-6"
        color={TypographyColor.Tertiary}
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
      >
        Moderated by
      </Typography>
      <div className="mt-2 flex flex-row items-center gap-3 laptop:mb-6">
        {squad.privilegedMembers?.slice(0, listMax).map((member) => (
          <PrivilegedMemberItem key={member.user.id} member={member} />
        ))}
        {privilegedLength > listMax && (
          <Button
            variant={ButtonVariant.Tertiary}
            className="aspect-square border border-border-subtlest-tertiary"
            onClick={() =>
              openModal({
                type: LazyModal.PrivilegedMembers,
                props: { source: squad },
              })
            }
          >
            +{privilegedLength - listMax}
          </Button>
        )}
      </div>
      <EnableNotification
        contentName={squad.name}
        source={NotificationPromptSource.SquadPage}
        className={classNames('w-full', !shouldUseListMode && MAX_WIDTH)}
      />
      <div
        className={classNames(
          'relative bottom-0 flex w-full flex-col bg-background-default pt-8 tablet:absolute tablet:translate-y-1/2 tablet:flex-row tablet:p-0',
          !shouldUseListMode && 'laptopL:px-0',
          shouldShowHighlightPulse && 'highlight-pulse',
          allowedToPost && 'items-center justify-center',
          allowedToPost && !shouldUseListMode && 'laptop:max-w-[41.5rem]',
          !allowedToPost && !shouldUseListMode && 'laptop:max-w-[38.25rem]',
        )}
      >
        <ConditionalWrapper
          condition={allowedToPost}
          wrapper={(children) => (
            <>
              <Divider />
              {children}
              <FlexCentered className="relative mx-2 my-2 w-full text-text-tertiary typo-callout tablet:w-auto">
                <span className="absolute -left-6 flex h-px w-[calc(100%+3rem)] bg-border-subtlest-tertiary tablet:hidden" />
                <span className="z-0 bg-background-default px-4">or</span>
              </FlexCentered>
              <Button
                tag="a"
                href={`${link.post.create}?sid=${squad.handle}`}
                variant={ButtonVariant.Primary}
                color={ButtonColor.Cabbage}
                className="w-full tablet:w-auto"
              >
                New post
              </Button>
              <Divider />
            </>
          )}
        >
          <SharePostBar
            className={classNames(
              'w-full',
              allowedToPost && 'max-w-[30.25rem]',
            )}
            disabled={!allowedToPost}
            disabledText={
              isSquadMember
                ? 'Only admins and moderators can post'
                : 'Join the Squad to create new posts'
            }
            squad={squad}
          />
        </ConditionalWrapper>
      </div>
    </FlexCol>
  );
}
