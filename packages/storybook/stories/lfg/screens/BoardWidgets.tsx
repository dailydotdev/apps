import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { SquadWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadWidget';
import { VolunteeringIcon } from '@dailydotdev/shared/src/components/icons/Volunteering';
import { me } from '../data';
import { useProto } from '../store';
import { helperAudience, helpTypesSummary } from '../ui';

// The why of Looking for group, the first widget on the board.
export const FindYourPeopleWidget = (): ReactElement => (
  <SquadWidget title="Find your people">
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Secondary}
      className="mt-1"
    >
      Work has never been more remote, more AI-assisted or more solo. Looking
      for group is for getting together again: find people to build with, learn
      with, or get unstuck with.
    </Typography>
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="mt-2"
    >
      Pro bono, always. No gigs, hiring or selling services.
    </Typography>
  </SquadWidget>
);

export const HelperWidget = ({
  onOpen,
}: {
  onOpen: () => void;
}): ReactElement => {
  const { state } = useProto();
  const helper = state.helpers[me.id];
  return (
    <SquadWidget
      title="Open to helping"
      action={
        helper && (
          <Button
            type="button"
            variant={ButtonVariant.Subtle}
            size={ButtonSize.Small}
            onClick={onOpen}
          >
            Edit
          </Button>
        )
      }
    >
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mt-1"
      >
        {helper
          ? [
              `${helpTypesSummary(helper.types)} on ${helper.tags
                .map((tag) => `#${tag}`)
                .join(' ')}.`,
              helperAudience(helper),
              `Up to ${helper.perMonth} a month. Only you can see this.`,
            ]
              .filter(Boolean)
              .join(' ')
          : 'Get a private heads-up when someone needs help with what you know. Nobody else sees this.'}
      </Typography>
      {!helper && (
        <Button
          type="button"
          className="mt-3 w-full"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          icon={<VolunteeringIcon />}
          onClick={onOpen}
        >
          Open to helping
        </Button>
      )}
    </SquadWidget>
  );
};
