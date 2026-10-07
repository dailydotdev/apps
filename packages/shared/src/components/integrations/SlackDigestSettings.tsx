import type { ReactElement } from 'react';
import React from 'react';
import type { SlackDigest } from '../../graphql/integrations';
import { useSlackDigests } from '../../hooks/integrations/slack/useSlackDigests';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { PlusIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import {
  formatSlackDigestSchedule,
  formatSlackDigestTopics,
  getSlackChannelLabel,
} from '../../lib/integrations';

export type SlackDigestSettingsProps = {
  integrationId: string;
};

export const SlackDigestSettings = ({
  integrationId,
}: SlackDigestSettingsProps): ReactElement => {
  const { digests } = useSlackDigests({ integrationId });
  const { openModal } = useLazyModal();

  const openForm = (digest?: SlackDigest) =>
    openModal({
      type: LazyModal.SlackDigest,
      props: { integrationId, digest },
    });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 px-2">
        <Typography type={TypographyType.Body} bold>
          Weekly team digests
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          The three posts your team read and shared most, posted to a channel
          once a week.
        </Typography>
      </div>
      {!!digests?.length && (
        <ul>
          {digests.map((digest) => (
            <li
              key={digest.id}
              className="flex w-full items-center gap-2 px-2 py-1"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Primary}
                  bold
                  truncate
                >
                  {getSlackChannelLabel(digest.channelName)}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  truncate
                >
                  {formatSlackDigestSchedule(digest)} ·{' '}
                  {formatSlackDigestTopics(digest)}
                </Typography>
              </div>
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                onClick={() => openForm(digest)}
              >
                Edit
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        className="self-start"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<PlusIcon />}
        onClick={() => openForm()}
      >
        Add a digest to a channel
      </Button>
    </div>
  );
};
