import React, { useMemo } from 'react';
import { RadioItemProps } from '../../components/fields/RadioItem';
import { isNullOrUndefined } from '../../lib/func';
import {
  StatusDescription,
  SquadStatus,
} from '../../components/squads/settings';
import {
  SettingsPublicSection,
  SettingsPublicSectionProps,
} from '../../components/squads/settings/SettingsPublicSection';

type UseSquadPrivacyOptionsProps = SettingsPublicSectionProps;

const classes = {
  wrapper: 'border border-border-subtlest-tertiary rounded-16 p-4 pt-1 w-full',
  content: 'w-fit',
};

export enum PrivacyOption {
  Private = 'private',
  Public = 'public',
}

export const useSquadPrivacyOptions = ({
  squadId,
  status,
  totalPosts,
}: UseSquadPrivacyOptionsProps): RadioItemProps<PrivacyOption>[] =>
  useMemo(() => {
    if (isNullOrUndefined(totalPosts)) {
      return [];
    }

    return [
      {
        label: 'Private',
        value: PrivacyOption.Private,
        className: classes,
        afterElement: (
          <StatusDescription className="ml-9">
            Only people who join the squad can see the content.
          </StatusDescription>
        ),
      },
      {
        label: 'Public',
        value: PrivacyOption.Public,
        disabled: status !== SquadStatus.Approved,
        className: classes,
        afterElement: (
          <SettingsPublicSection
            squadId={squadId}
            status={status}
            totalPosts={totalPosts}
          />
        ),
      },
    ];
  }, [status, totalPosts, squadId]);
