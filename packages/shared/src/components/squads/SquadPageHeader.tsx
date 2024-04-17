import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Squad, SourceMember, SourcePermissions } from '../../graphql/sources';
import { SquadHeaderBar } from './SquadHeaderBar';
import { SquadImage } from './SquadImage';
import EnableNotification from '../notifications/EnableNotification';
import { FlexCentered, FlexCol } from '../utilities';
import SquadMemberShortList from './SquadMemberShortList';
import SharePostBar from './SharePostBar';
import { TourScreenIndex } from './SquadTour';
import { useSquadTour } from '../../hooks/useSquadTour';
import { verifyPermission } from '../../graphql/squads';
import { NotificationPromptSource } from '../../lib/analytics';
import { useSquadChecklist } from '../../hooks/useSquadChecklist';
import { ActionType } from '../../graphql/actions';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';
import classed from '../../lib/classed';
import ConditionalWrapper from '../ConditionalWrapper';
import { link } from '../../lib/links';
import SquadChecklistCard from '../checklist/SquadChecklistCard';

interface SquadPageHeaderProps {
  squad: Squad;
  members: SourceMember[];
}

const MAX_WIDTH = 'laptopL:max-w-[38.5rem]';
const Divider = classed('span', 'flex flex-1 h-px bg-border-subtlest-tertiary');

export function SquadPageHeader({
  squad,
  members,
}: SquadPageHeaderProps): ReactElement {
  const { tourIndex } = useSquadTour();

  const { openStep, isChecklistVisible } = useSquadChecklist({ squad });
  const allowedToPost = verifyPermission(squad, SourcePermissions.Post);
  const shouldShowHighlightPulse =
    tourIndex === TourScreenIndex.Post ||
    (isChecklistVisible && openStep === ActionType.SquadFirstPost);
  const isSquadMember = !!squad.currentMember;

  return (
    <FlexCol
      className={classNames(
        'relative min-h-20 w-full items-center border-border-subtlest-tertiary px-6 tablet:mb-6 tablet:border-b tablet:pb-20 laptopL:items-start laptopL:px-18 laptopL:pb-14',
      )}
    >
      {isChecklistVisible && <SquadChecklistCard squad={squad} />}
      <div className="flex flex-col items-center laptopL:flex-row">
        <SquadImage className="h-16 w-16 tablet:h-24 tablet:w-24" {...squad} />
        <FlexCol className="mt-4 laptopL:ml-6 laptopL:mt-0">
          <h1 className="text-center font-bold typo-title2 laptopL:text-left">
            {squad.name}
          </h1>
          <h2 className="mt-1 text-center text-text-tertiary typo-body tablet:mt-2 laptopL:text-left">
            @{squad.handle}
          </h2>
        </FlexCol>
      </div>
      {squad.description && (
        <p
          className={classNames(
            'mt-6 w-full text-center text-text-tertiary typo-body laptopL:text-left',
            MAX_WIDTH,
          )}
        >
          {squad.description}
        </p>
      )}
      <SquadMemberShortList
        squad={squad}
        members={members}
        className="my-6 laptopL:hidden"
      />
      <SquadHeaderBar
        squad={squad}
        members={members}
        className="laptopL:absolute laptopL:right-18 laptopL:top-0"
      />
      <EnableNotification
        contentName={squad.name}
        source={NotificationPromptSource.SquadPage}
        className={classNames('w-full', MAX_WIDTH)}
      />
      <div
        className={classNames(
          'relative bottom-0 flex w-full flex-col bg-background-default pt-8 tablet:absolute tablet:translate-y-1/2 tablet:flex-row tablet:p-0 laptopL:px-0',
          shouldShowHighlightPulse && 'highlight-pulse',
          allowedToPost
            ? 'items-center justify-center laptop:max-w-[41.5rem]'
            : 'laptop:max-w-[38.25rem]',
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
                href={`${link.post.create}?sid=${squad?.handle}`}
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
