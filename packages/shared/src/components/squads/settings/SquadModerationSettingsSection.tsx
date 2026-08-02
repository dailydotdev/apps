import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { SquadSettingsSection } from './SquadSettingsSection';
import { Radio } from '../../fields/Radio';
import { SourceMemberRole } from '../../../graphql/sources';
import { TextField } from '../../fields/TextField';
import { WidgetCard } from '../../widgets/WidgetCard';
import { Tooltip } from '../../tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';

export enum SquadPostingGate {
  None = 'none',
  Moderation = 'moderation',
  Reputation = 'reputation',
}

export const DEFAULT_POSTING_MIN_REPUTATION = 250;

interface SquadModerationSettingsSectionProps {
  initialMemberPostingRole?: SourceMemberRole;
  initialMemberInviteRole?: SourceMemberRole;
  initialModerationRequired?: boolean;
  initialPostingMinReputation?: number | null;
}

const memberRoleOptions = [
  {
    label: 'All members (recommended)',
    value: SourceMemberRole.Member,
  },
  {
    label: 'Only moderators',
    value: SourceMemberRole.Moderator,
  },
];

// Each option spells out both halves of the outcome, since "who can post" and
// "does anyone review it" are easy to conflate once a threshold is involved.
const gateOption = (
  value: SquadPostingGate,
  label: string,
  description: string,
) => ({
  value,
  label,
  className: { wrapper: 'mb-1' },
  afterElement: (
    <Typography
      className="ml-8"
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
    >
      {description}
    </Typography>
  ),
});

const postingGateOptions = [
  gateOption(
    SquadPostingGate.None,
    'Anyone can post',
    'All members can post. No review.',
  ),
  gateOption(
    SquadPostingGate.Moderation,
    'Require post approval',
    'All members can post. Every post is reviewed.',
  ),
  gateOption(
    SquadPostingGate.Reputation,
    'Require a minimum reputation',
    'Only members with enough reputation can post. No review.',
  ),
];

const getInitialGate = (
  moderationRequired?: boolean,
  postingMinReputation?: number | null,
): SquadPostingGate => {
  if (typeof postingMinReputation === 'number') {
    return SquadPostingGate.Reputation;
  }

  return moderationRequired
    ? SquadPostingGate.Moderation
    : SquadPostingGate.None;
};

export function SquadModerationSettingsSection({
  initialMemberInviteRole,
  initialMemberPostingRole,
  initialModerationRequired,
  initialPostingMinReputation,
}: SquadModerationSettingsSectionProps): ReactElement {
  const [memberPostingRole, setMemberPostingRole] = useState(
    initialMemberPostingRole || SourceMemberRole.Moderator,
  );
  const [memberInviteRole, setMemberInviteRole] = useState(
    initialMemberInviteRole || SourceMemberRole.Member,
  );
  const [postingGate, setPostingGate] = useState(() =>
    getInitialGate(initialModerationRequired, initialPostingMinReputation),
  );

  // Both gates only ever apply to plain members, so they are meaningless when
  // members cannot post in the first place.
  const isMembersOnlyGateDisabled =
    memberPostingRole === SourceMemberRole.Moderator;

  const handleMemberPostingRole = (value: SourceMemberRole) => {
    setMemberPostingRole(value);
    if (value === SourceMemberRole.Moderator) {
      setPostingGate(SquadPostingGate.None);
    }
  };

  return (
    <WidgetCard heading="🔒 Moderation Settings">
      <div className="flex flex-col gap-6 px-4 py-2">
        <SquadSettingsSection
          title="Post content"
          description="Choose who is allowed to post new content in this Squad."
          className="flex"
        >
          <Radio
            name="memberPostingRole"
            options={memberRoleOptions}
            value={memberPostingRole}
            onChange={handleMemberPostingRole}
          />
        </SquadSettingsSection>
        <SquadSettingsSection
          title="Posting requirements"
          description="Choose who can post and whether their posts are reviewed first."
        >
          <Tooltip
            side="top"
            content="Only admins and moderators can post; their posts are auto-published."
            className="max-w-64 !p-2 text-center"
            visible={isMembersOnlyGateDisabled}
          >
            <span className="max-w-fit">
              <Radio
                name="postingGate"
                options={postingGateOptions}
                value={postingGate}
                disabled={isMembersOnlyGateDisabled}
                onChange={(value) => setPostingGate(value as SquadPostingGate)}
              />
            </span>
          </Tooltip>
          {postingGate === SquadPostingGate.Reputation && (
            <TextField
              className={{ container: 'mt-4 max-w-60' }}
              inputId="postingMinReputation"
              name="postingMinReputation"
              label="Minimum reputation"
              type="number"
              min={0}
              required
              defaultValue={`${
                initialPostingMinReputation ?? DEFAULT_POSTING_MIN_REPUTATION
              }`}
            />
          )}
        </SquadSettingsSection>
        <SquadSettingsSection
          title="Invitation permissions"
          description="Choose who is allowed to invite new members to this Squad."
        >
          <Radio
            name="memberInviteRole"
            options={memberRoleOptions}
            value={memberInviteRole}
            onChange={(value) => setMemberInviteRole(value as SourceMemberRole)}
          />
        </SquadSettingsSection>
      </div>
    </WidgetCard>
  );
}
