import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { BasicSourceMember, Squad } from '../../graphql/sources';
import { SourcePermissions } from '../../graphql/sources';
import { SquadHeaderBar } from './SquadHeaderBar';
import { SquadImage } from './SquadImage';
import EnableNotification from '../notifications/EnableNotification';
import { FlexCentered, FlexCol } from '../utilities';
import SharePostBar from './SharePostBar';
import { verifyPermission } from '../../graphql/squads';
import { NotificationPromptSource } from '../../lib/log';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';
import classed from '../../lib/classed';
import ConditionalWrapper from '../ConditionalWrapper';
import { link } from '../../lib/links';
import { Separator } from '../cards/common/common';
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
import { ClickableText } from '../buttons/ClickableText';

interface SquadPageHeaderProps {
  squad: Squad;
  members: BasicSourceMember[];
  shouldUseListMode: boolean;
}

const MAX_WIDTH = 'laptopL:max-w-[38.5rem]';
const Divider = classed('span', 'flex flex-1 h-px bg-border-subtlest-tertiary');

export function SquadPageHeader({
  squad,
  members,
  shouldUseListMode,
}: SquadPageHeaderProps): ReactElement {
  const { openModal } = useLazyModal();
  const allowedToPost = verifyPermission(squad, SourcePermissions.Post);
  const { category } = squad;
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
        'border-border-subtlest-tertiary tablet:mb-12 tablet:border-b tablet:pb-16 relative mb-6 mt-3 min-h-20 w-full items-start px-6',
        shouldUseListMode
          ? 'laptop:!mx-auto laptop:mb-6 laptop:!max-w-[42.5rem] laptop:!px-0'
          : 'laptop:mb-12 laptopL:px-18',
      )}
    >
      <div className="tablet:flex-row tablet:items-center flex flex-col items-start gap-6">
        <SquadImage className="tablet:h-24 tablet:w-24 h-16 w-16" {...squad} />
        <FlexCol>
          <Typography tag={TypographyTag.H1} bold type={TypographyType.Title2}>
            {squad.name}
          </Typography>
          <div className="text-text-quaternary typo-subhead mt-1 flex flex-row items-center">
            <Typography tag={TypographyTag.H2} color={TypographyColor.Tertiary}>
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
                  href={`/squads/discover/${category.slug}`}
                  title={`View all squads in ${category.title}`}
                >
                  {category.title}
                </a>
              </>
            )}
          </div>
          <div className="tablet:flex-row tablet:items-center mt-4 flex flex-col items-start gap-2">
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
              {squad.flags?.totalAwards ? (
                <ClickableText
                  onClick={() => {
                    openModal({
                      type: LazyModal.ListAwards,
                      props: {
                        queryProps: {
                          id: squad.id,
                          type: 'SQUAD',
                        },
                      },
                    });
                  }}
                >
                  <SquadStat
                    count={squad.flags?.totalAwards ?? 0}
                    label="Awards"
                  />
                </ClickableText>
              ) : undefined}
            </ConditionalWrapper>
          </div>
        </FlexCol>
      </div>
      {squad.description && (
        <Typography
          tag={TypographyTag.P}
          color={TypographyColor.Secondary}
          type={TypographyType.Callout}
          className={classNames('mt-5 w-full', MAX_WIDTH)}
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
      <div className="mt-2 flex flex-row items-center gap-3">
        {squad.privilegedMembers?.slice(0, listMax).map((member) => (
          <PrivilegedMemberItem key={member.user.id} member={member} />
        ))}
        {privilegedLength > listMax && (
          <Button
            variant={ButtonVariant.Tertiary}
            className="border-border-subtlest-tertiary aspect-square border"
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
        className={classNames('w-full', MAX_WIDTH)}
      />
      <div
        className={classNames(
          'bg-background-default tablet:absolute tablet:translate-y-1/2 tablet:flex-row tablet:p-0 laptopL:px-0 relative bottom-0 flex w-full flex-col pt-8',
          allowedToPost && 'items-center justify-center',
          allowedToPost && 'laptop:max-w-[41.5rem]',
          !allowedToPost && 'laptop:max-w-[38.25rem]',
        )}
      >
        <ConditionalWrapper
          condition={allowedToPost}
          wrapper={(children) => (
            <>
              <Divider />
              {children}
              <FlexCentered className="text-text-tertiary typo-callout tablet:w-auto relative mx-2 my-2 w-full">
                <span className="bg-border-subtlest-tertiary tablet:hidden absolute -left-6 flex h-px w-[calc(100%+3rem)]" />
                <span className="bg-background-default z-0 px-4">or</span>
              </FlexCentered>
              <Button
                tag="a"
                href={`${link.post.create}?sid=${squad.handle}`}
                variant={ButtonVariant.Primary}
                color={ButtonColor.Cabbage}
                className="tablet:w-auto w-full"
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
