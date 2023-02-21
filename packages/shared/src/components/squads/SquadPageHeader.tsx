import React, { ReactElement } from 'react';
import { Squad, SquadMember } from '../../graphql/squads';
import { Button } from '../buttons/Button';
import FeedbackIcon from '../icons/Feedback';
import { SquadHeaderBar } from './SquadHeaderBar';
import { SquadImage } from './SquadImage';
import { squadFeedback } from '../../lib/constants';
import EnableNotification from '../notifications/EnableNotification';
import { NotificationPromptSource } from '../../hooks/useEnableNotification';

type SquadPageHeaderProps = {
  userId: string;
  squad: Squad;
  members: SquadMember[];
  onNewSquadPost: () => void;
};

export function SquadPageHeader({
  userId,
  squad,
  members,
  onNewSquadPost,
}: SquadPageHeaderProps): ReactElement {
  return (
    <section className="min-h-20 mb-6 flex w-full flex-col items-center border-theme-divider-tertiary px-6 pb-0 tablet:border-b tablet:pb-10">
      <Button
        tag="a"
        target="_blank"
        rel="noopener noreferrer"
        href={`${squadFeedback}#user_id=${userId}&squad_id=${squad.id}`}
        className="btn btn-secondary top-5 right-4"
        position="absolute"
        icon={
          <FeedbackIcon
            className="hidden tablet:flex"
            size="medium"
            aria-label="squad-feedback-icon"
          />
        }
        buttonSize="small"
        aria-label="squad-feedback"
      >
        Feedback
      </Button>
      <SquadImage
        className="mt-4 h-16 w-16 tablet:h-24 tablet:w-24"
        {...squad}
      />
      <h3 className="mt-4 font-bold typo-title2 tablet:mt-6">{squad.name}</h3>
      <h4 className="mt-1 text-theme-label-tertiary typo-body tablet:mt-2">
        @{squad.handle}
      </h4>
      <p className="mt-5 w-full  max-w-[42rem] text-center text-theme-label-secondary typo-body tablet:mt-4">
        {squad.description}
      </p>
      <SquadHeaderBar
        className="mt-6"
        squad={squad}
        members={members}
        memberCount={squad.membersCount}
        onNewSquadPost={onNewSquadPost}
      />
      <EnableNotification
        contentName={squad.name}
        source={NotificationPromptSource.SquadPage}
      />
    </section>
  );
}
