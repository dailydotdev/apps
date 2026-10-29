import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Switch } from '../../../components/fields/Switch';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { Divider } from '../../../components/utilities/Divider';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { Origin } from '../../../lib/log';
import type { FeedPersonalizationReset } from '../graphql';
import {
  useFeedControls,
  useFeedPersonalizationReset,
} from '../useFeedControls';
import { useForYouControlsAvailable } from '../useFeedExplainMode';

const SettingTitle = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1">
    <Typography bold type={TypographyType.Body}>
      {title}
    </Typography>
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      {children}
    </Typography>
  </div>
);

interface ResetRowProps {
  title: string;
  description: string;
  reset: FeedPersonalizationReset;
  doneMessage: string;
}

const ResetRow = ({
  title,
  description,
  reset,
  doneMessage,
}: ResetRowProps): ReactElement => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { reset: onReset, isPending } = useFeedPersonalizationReset({
    origin: Origin.Settings,
  });
  const { displayToast } = useToastNotification();

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <span className="flex min-w-0 flex-[1_1_16rem] flex-col">
        <Typography type={TypographyType.Callout} bold>
          {title}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {description}
        </Typography>
      </span>
      {isConfirming ? (
        <span className="flex gap-2">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={() => setIsConfirming(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Ketchup}
            size={ButtonSize.Small}
            loading={isPending}
            onClick={async () => {
              if (await onReset(reset)) {
                displayToast(doneMessage);
              }
              setIsConfirming(false);
            }}
          >
            Yes, reset
          </Button>
        </span>
      ) : (
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={() => setIsConfirming(true)}
        >
          Reset
        </Button>
      )}
    </li>
  );
};

/**
 * How For You learns and fills itself, and the resets. Only where the
 * reader's For You ranking takes these settings.
 */
export const ForYouSettings = (): ReactElement | null => {
  const isAvailable = useForYouControlsAvailable();
  const { controls, setLearning, setFillIns } = useFeedControls({
    origin: Origin.Settings,
    enabled: isAvailable,
  });
  const { feedSettings } = useFeedSettings();

  if (!isAvailable || !controls) {
    return null;
  }

  const hasFollows =
    !!feedSettings?.includeTags?.length ||
    !!feedSettings?.includeSources?.length;

  return (
    <>
      <Divider className="my-1 bg-border-subtlest-tertiary" />
      <div className="flex flex-col gap-4">
        <SettingTitle title="Learn from your reading">
          Topics you read about count in For You, even ones you don&apos;t
          follow. Turn it off and only your follows count.
        </SettingTitle>
        <Switch
          inputId="for-you-learning"
          name="for-you-learning"
          compact={false}
          checked={controls.learning}
          onToggle={() => setLearning(!controls.learning)}
        >
          Learn from my reading
        </Switch>
      </div>
      <Divider className="my-1 bg-border-subtlest-tertiary" />
      <div className="flex flex-col gap-4">
        <SettingTitle title="Popular posts">
          When your topics and follows don&apos;t find enough posts for For You,
          popular posts fill the rest. Turn it off and For You shows only what
          your topics and follows find, even when that&apos;s only a few posts.
        </SettingTitle>
        <Switch
          inputId="for-you-fill-ins"
          name="for-you-fill-ins"
          compact={false}
          checked={controls.fillIns}
          onToggle={() => setFillIns(!controls.fillIns)}
        >
          Fill a short feed with popular posts
        </Switch>
        {!hasFollows && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Until you follow a topic or source, popular posts keep filling For
            You so it&apos;s never empty.
          </Typography>
        )}
      </div>
      <Divider className="my-1 bg-border-subtlest-tertiary" />
      <div className="flex flex-col gap-1">
        <SettingTitle title="Start over">
          Each reset works on its own and leaves your follows, blocks and topic
          levels alone.
        </SettingTitle>
        <ul className="flex flex-col">
          <ResetRow
            title="Forget my reading"
            description="For You forgets the topics it learned from your reading, and topics you follow lose the boost reading gave them. It learns again from what you read next."
            reset={{ learned: true, seen: false }}
            doneMessage="For You forgot your reading"
          />
          <ResetRow
            title="Forget what I scrolled past"
            description="Posts you scrolled past can show up in For You again."
            reset={{ learned: false, seen: true }}
            doneMessage="For You forgot what you scrolled past"
          />
        </ul>
      </div>
    </>
  );
};
