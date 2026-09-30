import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import Autocomplete from '../fields/Autocomplete';
import { Dropdown } from '../fields/Dropdown';
import { HourDropdown } from '../fields/HourDropdown';
import { Radio } from '../fields/Radio';
import { Switch } from '../fields/Switch';
import { TextField } from '../fields/TextField';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { SlackDigest } from '../../graphql/integrations';
import { useSlackChannelsQuery } from '../../hooks/integrations/slack/useSlackChannelsQuery';
import { useSlackDigests } from '../../hooks/integrations/slack/useSlackDigests';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { getUserInitialTimezone } from '../../lib/timezones';
import {
  defaultSlackDigestSchedule,
  getSlackChannelLabel,
  slackDigestWeekdays,
} from '../../lib/integrations';
import { LogEvent, Origin } from '../../lib/log';

export type SlackDigestModalProps = Omit<ModalProps, 'children'> & {
  integrationId: string;
  digest?: SlackDigest;
};

enum TopicsScope {
  All = 'all',
  Chosen = 'chosen',
}

const maxVisibleChannels = 20;

const parseTags = (value: string): string[] =>
  Array.from(
    new Set(
      value
        .split(/[\s,]+/)
        .map((tag) => tag.replace(/^#/, '').trim().toLowerCase())
        .filter(Boolean),
    ),
  );

const SlackDigestModal = ({
  integrationId,
  digest,
  ...props
}: SlackDigestModalProps): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { upsertDigest, deleteDigest, isSaving } = useSlackDigests({
    integrationId,
  });
  const { channels, isFetchingAll } = useSlackChannelsQuery({
    integrationId,
    fetchAll: true,
  });
  const [channelQuery, setChannelQuery] = useState('');
  const [channelId, setChannelId] = useState(digest?.channelId);
  const [weekday, setWeekday] = useState(
    digest?.weekday ?? defaultSlackDigestSchedule.weekday,
  );
  const [hour, setHour] = useState(
    digest?.hour ?? defaultSlackDigestSchedule.hour,
  );
  const [topicsScope, setTopicsScope] = useState(
    digest?.tags.length ? TopicsScope.Chosen : TopicsScope.All,
  );
  const [tagsInput, setTagsInput] = useState(digest?.tags.join(', ') ?? '');
  const [includeTeamStats, setIncludeTeamStats] = useState(
    digest?.includeTeamStats ?? true,
  );
  const tags = topicsScope === TopicsScope.Chosen ? parseTags(tagsInput) : [];
  const isChosenTopicsEmpty =
    topicsScope === TopicsScope.Chosen && !tags.length;

  const channelOptions = useMemo(() => {
    const query = channelQuery.trim().toLowerCase().replace(/^#/, '');
    const matches = query
      ? channels.filter(({ name }) => name.toLowerCase().includes(query))
      : channels;
    const options = matches
      .slice(0, maxVisibleChannels)
      .map(({ id, name }) => ({
        value: id,
        label: getSlackChannelLabel(name),
      }));

    // the field resets its text to the selected option's label on blur, so
    // the digest's own channel has to stay listed while the rest page in
    if (
      digest &&
      digest.channelId === channelId &&
      !options.some(({ value }) => value === digest.channelId)
    ) {
      return [
        {
          value: digest.channelId,
          label: getSlackChannelLabel(digest.channelName),
        },
        ...options,
      ];
    }

    return options;
  }, [channels, channelQuery, channelId, digest]);

  const onSave = async (event: React.MouseEvent) => {
    if (!channelId) {
      return;
    }

    try {
      const saved = await upsertDigest({
        id: digest?.id,
        integrationId,
        channelId,
        weekday,
        hour,
        timezone:
          digest?.timezone ??
          getUserInitialTimezone({ userTimezone: user?.timezone }),
        tags,
        includeTeamStats,
      });

      logEvent({
        event_name: digest
          ? LogEvent.UpdateSlackDigest
          : LogEvent.CreateSlackDigest,
        target_id: saved.id,
        extra: JSON.stringify({ origin: Origin.Settings }),
      });

      props.onRequestClose?.(event);
    } catch {
      displayToast('Could not save the digest, please try again');
    }
  };

  const onDelete = async (event: React.MouseEvent) => {
    if (!digest) {
      return;
    }

    try {
      await deleteDigest(digest.id);

      logEvent({
        event_name: LogEvent.DeleteSlackDigest,
        target_id: digest.id,
        extra: JSON.stringify({ origin: Origin.Settings }),
      });

      props.onRequestClose?.(event);
    } catch {
      displayToast('Could not remove the digest, please try again');
    }
  };

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      isDrawerOnMobile
      {...props}
    >
      <ModalClose
        className="right-4 top-4"
        onClick={props.onRequestClose}
        variant={ButtonVariant.Tertiary}
      />
      <Modal.Body className="flex flex-col gap-4">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Title3}
          color={TypographyColor.Primary}
          bold
        >
          {digest ? 'Edit digest' : 'Add a weekly digest'}
        </Typography>
        <Autocomplete
          name="slack-digest-channel"
          fieldType="secondary"
          label="Channel"
          placeholder={isFetchingAll ? 'Loading channels' : 'Select a channel'}
          defaultValue={
            digest ? getSlackChannelLabel(digest.channelName) : undefined
          }
          options={channelOptions}
          isLoading={isFetchingAll}
          selectedValue={channelId}
          onChange={setChannelQuery}
          onSelect={setChannelId}
        />
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            When
          </Typography>
          <div className="flex gap-2">
            <Dropdown
              className={{ container: 'flex-1' }}
              selectedIndex={weekday}
              options={slackDigestWeekdays.map((day) => `${day}s`)}
              onChange={(_, index) => setWeekday(index)}
            />
            <HourDropdown
              className={{ container: 'flex-1' }}
              hourIndex={hour}
              setHourIndex={setHour}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Typography type={TypographyType.Callout} bold>
            Topics
          </Typography>
          <Radio<TopicsScope>
            name="slack-digest-topics"
            value={topicsScope}
            options={[
              { label: 'Everything the team reads', value: TopicsScope.All },
              { label: 'Only some tags', value: TopicsScope.Chosen },
            ]}
            onChange={setTopicsScope}
          />
          {topicsScope === TopicsScope.Chosen && (
            <TextField
              inputId="slack-digest-tags"
              name="slack-digest-tags"
              label="Tags"
              placeholder="react, css, webperf"
              hint="Separate tags with commas"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
            />
          )}
        </div>
        <Switch
          inputId="slack-digest-team-stats"
          name="slack-digest-team-stats"
          compact={false}
          checked={includeTeamStats}
          onToggle={() => setIncludeTeamStats((value) => !value)}
        >
          Team stats: how many of you read each post
        </Switch>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          disabled={!channelId || isChosenTopicsEmpty}
          loading={isSaving}
          onClick={onSave}
        >
          Save
        </Button>
        {!!digest && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Large}
            disabled={isSaving}
            onClick={onDelete}
          >
            Remove digest
          </Button>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default SlackDigestModal;
