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
  shouldUseListModeV1: boolean;
}

const MAX_WIDTH = 'laptopL:max-w-[38.5rem]';
const Divider = classed('span', 'flex flex-1 h-px bg-border-subtlest-tertiary');

export function SquadPageHeader({
  squad,
  members,
  shouldUseListModeV1,
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
        'relative min-h-20 w-full items-center border-border-subtlest-tertiary px-6 tablet:mb-6 tablet:border-b tablet:pb-20',
        !shouldUseListModeV1 &&
          'laptopL:items-start laptopL:px-18 laptopL:pb-14',
      )}
    >
      {isChecklistVisible && <SquadChecklistCard squad={squad} />}
      <div
        className={classNames(
          !shouldUseListModeV1 && 'laptopL:flex-row',
          'flex flex-col items-center ',
        )}
      >
        <SquadImage className="h-16 w-16 tablet:h-24 tablet:w-24" {...squad} />
        <FlexCol
          className={classNames(
            'mt-4',
            !shouldUseListModeV1 && 'laptopL:ml-6 laptopL:mt-0',
          )}
        >
          <h1
            className={classNames(
              'text-center font-bold typo-title2 laptopL:text-left',
              !shouldUseListModeV1 && 'laptopL:text-left',
            )}
          >
            {squad.name}
          </h1>
          <h2
            className={classNames(
              'mt-1 text-center text-text-tertiary typo-body tablet:mt-2',
              !shouldUseListModeV1 && 'laptopL:text-left',
            )}
          >
            @{squad.handle}
          </h2>
        </FlexCol>
      </div>
      {squad.description && (
        <p
          className={classNames(
            'mt-6 w-full text-center text-text-tertiary typo-body',
            !shouldUseListModeV1 && 'laptopL:text-left',
            !shouldUseListModeV1 && MAX_WIDTH,
          )}
        >
          {squad.description}
        </p>
      )}
      <SquadMemberShortList
        squad={squad}
        members={members}
        className={classNames('my-6', !shouldUseListModeV1 && 'laptopL:hidden')}
      />
      <SquadHeaderBar
        squad={squad}
        members={members}
        className={classNames(
          !shouldUseListModeV1 &&
            'laptopL:absolute laptopL:right-18 laptopL:top-0',
        )}
        shouldUseListModeV1={shouldUseListModeV1}
      />
      <EnableNotification
        contentName={squad.name}
        source={NotificationPromptSource.SquadPage}
        className={classNames('w-full', !shouldUseListModeV1 && MAX_WIDTH)}
      />
      <div
        className={classNames(
          'relative bottom-0 flex w-full flex-col bg-background-default pt-8 tablet:absolute tablet:translate-y-1/2 tablet:flex-row tablet:p-0',
          !shouldUseListModeV1 && 'laptopL:px-0',
          shouldShowHighlightPulse && 'highlight-pulse',
          allowedToPost && 'items-center justify-center',
          allowedToPost && !shouldUseListModeV1 && 'laptop:max-w-[41.5rem]',
          !allowedToPost && !shouldUseListModeV1 && 'laptop:max-w-[38.25rem]',
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
