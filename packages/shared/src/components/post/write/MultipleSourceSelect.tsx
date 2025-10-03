import type { PropsWithChildren } from 'react';
import React, { useMemo, useCallback } from 'react';
import classNames from 'classnames';
import { SourceAvatar } from '../../profile/source';
import { MiniCloseIcon, ArrowIcon } from '../../icons';
import type { Squad } from '../../../graphql/sources';
import {
  SourceMemberRole,
  SourceType,
  SourcePermissions,
} from '../../../graphql/sources';
import {
  ButtonSize,
  ButtonVariant,
  ButtonIconPosition,
} from '../../buttons/common';
import { ProfileImageSize } from '../../ProfilePicture';
import { cloudinarySquadsImageFallback } from '../../../lib/image';

import { Button } from '../../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { useAuthContext } from '../../../contexts/AuthContext';
import { TruncateText } from '../../utilities';
import type { LoggedUser } from '../../../lib/user';
import { PopoverFormContainer } from '../../../features/common/components/PopoverFormContainer';
import type { CheckboxProps } from '../../fields/Checkbox';
import { Checkbox } from '../../fields/Checkbox';
import { IconSize } from '../../Icon';
import { verifyPermission } from '../../../graphql/squads';
import SpamWarning from '../../widgets/SpamWarning';
import { Tooltip } from '../../tooltip/Tooltip';
import ConditionalWrapper from '../../ConditionalWrapper';
import { anchorDefaultRel } from '../../../lib/strings';
import { webappUrl } from '../../../lib/constants';
import { LazyImage } from '../../LazyImage';
import { labels } from '../../../lib';

const defaultSquad = {
  image: cloudinarySquadsImageFallback,
  permalink: null,
  active: true,
  public: false,
  membersCount: 1,
  description: null,
  memberPostingRole: SourceMemberRole.Admin,
  memberInviteRole: SourceMemberRole.Admin,
};

export const generateDefaultSquad = (username: string): Squad => ({
  ...defaultSquad,
  id: username,
  handle: username,
  name: `${username}'s public Squad`,
  type: SourceType.Squad,
  memberPostingRole: SourceMemberRole.Moderator,
  memberInviteRole: SourceMemberRole.Member,
  moderationPostCount: 0,
  moderationRequired: false,
});

export const generateUserSourceAsSquad = (user: LoggedUser): Squad => ({
  ...generateDefaultSquad(user.username),
  id: user.id,
  name: user.name,
  handle: user.id,
  // @ts-expect-error Intentionally using a UserSource as a Squad
  type: SourceType.User,
  image: user.image,
});

const Label = ({ children }: PropsWithChildren) => (
  <Typography type={TypographyType.Caption1} color={TypographyColor.Quaternary}>
    {children}
  </Typography>
);

const CreateNewSquadLink = () => (
  <a
    className="flex items-center gap-2"
    href={`${webappUrl}squads/new`}
    rel={anchorDefaultRel}
    target="_blank"
  >
    <LazyImage
      imgSrc={defaultSquad.image}
      imgAlt="New squad image"
      className="size-8 rounded-full"
      aria-hidden
      role="presentation"
    />
    <Typography
      bold
      className="flex-1"
      color={TypographyColor.Primary}
      type={TypographyType.Callout}
    >
      Create a new squad
    </Typography>
    <ArrowIcon aria-hidden className="rotate-90" />
  </a>
);

const MAX_SQUADS_COUNT = 3;

const SourceCheckbox = ({
  source,
  disabled = false,
  ...props
}: {
  source: Omit<Squad, 'type'> & { type: SourceType };
} & CheckboxProps) => {
  const isUserSource = source.type === SourceType.User;
  return (
    <ConditionalWrapper
      condition={disabled}
      wrapper={(content) => (
        <Tooltip
          content={`You can't choose more than ${MAX_SQUADS_COUNT} squads.`}
        >
          <div>{content}</div>
        </Tooltip>
      )}
    >
      <Checkbox
        {...props}
        disabled={disabled}
        className="min-w-full flex-row-reverse gap-2 !p-0"
        checkmarkClassName="!mr-0"
      >
        <div className="flex items-center">
          <SourceAvatar source={source} size={ProfileImageSize.Medium} />
          <div className="flex flex-col">
            <Typography
              bold
              color={
                disabled ? TypographyColor.Tertiary : TypographyColor.Primary
              }
              type={TypographyType.Callout}
            >
              {isUserSource ? 'Everyone' : source.name}
            </Typography>
            {!isUserSource && source.handle && (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                @{source.handle}
              </Typography>
            )}
          </div>
        </div>
      </Checkbox>
    </ConditionalWrapper>
  );
};

interface SourceMultipleSelectProps {
  className?: string;
  selected: string[];
  setSelected: (selected: string[]) => void;
}

export const MultipleSourceSelect = ({
  className,
  selected,
  setSelected,
}: SourceMultipleSelectProps) => {
  const { user, squads: allSquads } = useAuthContext();
  const userSource = useMemo(() => generateUserSourceAsSquad(user), [user]);
  const squads = useMemo(
    () =>
      allSquads.filter(
        (squad) =>
          squad?.active && verifyPermission(squad, SourcePermissions.Post),
      ),
    [allSquads],
  );
  const squadsMapById = useMemo(
    () =>
      squads.reduce<Record<string, Squad>>((acc, squad) => {
        acc[squad.id] = squad;
        return acc;
      }, {}),
    [squads],
  );
  const selectedSquads = useMemo(
    () =>
      selected
        .filter((sourceId) => sourceId !== userSource.id)
        .map((sourceId) => squadsMapById[sourceId]),
    [selected, squadsMapById, userSource.id],
  );
  const toggleSource = useCallback(
    (sourceId: string) => {
      if (selected.includes(sourceId)) {
        setSelected(selected.filter((id) => id !== sourceId));
        return;
      }
      if (
        userSource.id !== sourceId &&
        selectedSquads.length >= MAX_SQUADS_COUNT
      ) {
        return;
      }
      setSelected([...selected, sourceId]);
    },
    [selected, selectedSquads.length, setSelected, userSource.id],
  );

  const isUserSourceSelected = selected.includes(userSource.id);
  const sourceImage = isUserSourceSelected
    ? userSource.image
    : selectedSquads.at(0)?.image;
  const triggerImage = sourceImage || defaultSquad.image;

  return (
    <>
      <PopoverFormContainer
        className={classNames(className, 'laptop:max-w-70')}
        onReset={() => setSelected([user?.id])}
        submitProps={{ disabled: !selected.length }}
        triggerChildren={
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <img src={triggerImage} alt="Squad" className="size-6 rounded-4" />
            <TruncateText className="min-w-0 flex-1 text-left font-normal">
              {!selected.length && 'Select one or more'}
              {isUserSourceSelected && 'Everyone'}
              {isUserSourceSelected && selectedSquads.length > 0 && ', '}
              {selectedSquads.map((squad) => squad.name).join(', ')}
            </TruncateText>
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          {!!selectedSquads.length && (
            <>
              <Label>You can choose up to 3 squads</Label>
              <div className="my-1 flex flex-wrap gap-2">
                {selectedSquads.map((squad) => (
                  <Button
                    key={squad.id}
                    onClick={() => toggleSource(squad.id)}
                    aria-label={`Remove ${squad.name} from selection`}
                    className="typo-caption1"
                    icon={<MiniCloseIcon size={IconSize.Size16} aria-hidden />}
                    iconPosition={ButtonIconPosition.Right}
                    size={ButtonSize.XSmall}
                    title={`Remove ${squad.name} from selection`}
                    variant={ButtonVariant.Subtle}
                  >
                    {squad?.name}
                  </Button>
                ))}
              </div>
            </>
          )}
          <Label>Public</Label>
          <SourceCheckbox
            checked={isUserSourceSelected}
            name="sources[]"
            onChange={() => toggleSource(userSource.id)}
            source={userSource}
          />
          {!!squads.length && <Label>Squads you&#39;ve joined</Label>}
          {squads.map((squad) => {
            const isSelected = selected.includes(squad.id);
            return (
              <SourceCheckbox
                key={squad.id}
                checked={isSelected}
                disabled={
                  selectedSquads.length >= MAX_SQUADS_COUNT && !isSelected
                }
                name="sources[]"
                onChange={() => toggleSource(squad.id)}
                source={squad}
              />
            );
          })}
          {/*  OR create a new squad */}
          <CreateNewSquadLink />
        </div>
      </PopoverFormContainer>
      {selectedSquads.length > 1 && (
        <SpamWarning content={labels.postCreation.warnings.spammyPosts} />
      )}
    </>
  );
};

export default MultipleSourceSelect;
