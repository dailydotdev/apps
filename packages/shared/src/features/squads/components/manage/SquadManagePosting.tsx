import type { FormEvent, ReactElement } from 'react';
import React from 'react';
import type { SourceMemberRole } from '../../../../graphql/sources';
import type { SquadPostingGate } from '../../../../components/squads/settings/SquadModerationSettingsSection';
import {
  postingGateToInput,
  SquadModerationSettingsSection,
} from '../../../../components/squads/settings/SquadModerationSettingsSection';
import { formToJson } from '../../../../lib/form';
import { useSquadPageContext } from '../../SquadPageContext';
import { useEditSquad } from '../../hooks/useEditSquad';
import { SquadManageSection } from '../../lib/routes';
import {
  SquadManageSaveButton,
  SquadManageSectionPanel,
} from './SquadManageLayout';

const formId = 'squad-manage-posting';

type PostingFields = {
  memberPostingRole: SourceMemberRole;
  memberInviteRole: SourceMemberRole;
  postingGate?: SquadPostingGate;
  postingMinReputation?: string;
};

export const SquadManagePosting = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { onEdit, isPending } = useEditSquad(squad);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { postingGate, postingMinReputation, ...roles } =
      formToJson<PostingFields>(event.currentTarget);

    onEdit({
      ...roles,
      ...postingGateToInput(postingGate, postingMinReputation),
    }).catch(() => null);
  };

  return (
    <SquadManageSectionPanel
      section={SquadManageSection.Posting}
      action={<SquadManageSaveButton formId={formId} isLoading={isPending} />}
    >
      <form id={formId} onSubmit={onSubmit} className="py-4 tablet:px-2">
        <SquadModerationSettingsSection
          isBare
          initialMemberPostingRole={squad.memberPostingRole}
          initialMemberInviteRole={squad.memberInviteRole}
          initialModerationRequired={squad.moderationRequired}
          initialPostingMinReputation={squad.postingMinReputation}
        />
      </form>
    </SquadManageSectionPanel>
  );
};
