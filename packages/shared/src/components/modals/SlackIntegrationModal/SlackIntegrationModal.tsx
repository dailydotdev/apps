import classNames from 'classnames';
import React, { ReactElement, useEffect, useRef } from 'react';

import { useLogContext } from '../../../contexts/LogContext';
import { UserIntegrationType } from '../../../graphql/integrations';
import { Source } from '../../../graphql/sources';
import { useViewSize, ViewSize } from '../../../hooks';
import { useIntegration } from '../../../hooks/integrations/useIntegration';
import { useThemedAsset } from '../../../hooks/utils';
import { slackIntegration } from '../../../lib/constants';
import { LogEvent } from '../../../lib/log';
import { Button } from '../../buttons/Button';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Dropdown } from '../../fields/Dropdown';
import { PlusIcon, SlackIcon } from '../../icons';
import { Loader } from '../../Loader';
import { SourceAvatar } from '../../profile/source';
import { ProfileImageSize } from '../../ProfilePicture';
import { Bubble } from '../../tooltips/utils';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Modal, ModalProps } from '../common/Modal';
import { ModalClose } from '../common/ModalClose';
import { SlackIntegrationIntroBody } from './SlackIntegrationIntroBody';
import { useSlackIntegrationModal } from './useSlackIntegrationModal';

export type SlackIntegrationModalProps = Omit<ModalProps, 'children'> & {
  source: Pick<Source, 'id' | 'handle' | 'type' | 'image' | 'name'>;
  trackStart?: boolean;
};

const SlackIntegrationModal = ({
  source,
  trackStart,
  ...props
}: SlackIntegrationModalProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { removeSourceIntegration } = useIntegration();
  const { logEvent } = useLogContext();

  const {
    slackIntegrations,
    channels,
    isLoadingIntegrations,
    selectedIntegration,
    selectedIntegrationIndex,
    selectedChannelIndex,
    isSaving,
    onSave,
    onConnectNew,
    onWorkspaceChange,
    onChannelChange,
    hasIntegrations,
  } = useSlackIntegrationModal({ source });

  const isStartTracked = useRef(false);

  useEffect(() => {
    if (!trackStart || isLoadingIntegrations) {
      return;
    }

    if (isStartTracked.current) {
      return;
    }

    isStartTracked.current = true;

    logEvent({
      event_name: LogEvent.StartAddingIntegration,
      target_id: UserIntegrationType.Slack,
      extra: JSON.stringify({
        source: source.id,
        has_integrations: hasIntegrations,
      }),
    });
  }, [trackStart, isLoadingIntegrations, logEvent, source.id, hasIntegrations]);

  const isManageTracked = useRef(false);

  useEffect(() => {
    if (!hasIntegrations) {
      return;
    }

    if (isManageTracked.current) {
      return;
    }

    isManageTracked.current = true;

    logEvent({
      event_name: LogEvent.ManageIntegration,
      target_id: UserIntegrationType.Slack,
      extra: JSON.stringify({
        source: source.id,
      }),
    });
  }, [hasIntegrations, logEvent, source.id]);

  const { slackIntegrationHeader } = useThemedAsset();

  return (
    <Modal
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      isDrawerOnMobile
      {...props}
    >
      {!isLoadingIntegrations && (
        <ModalClose
          className={classNames(
            hasIntegrations ? 'right-4 top-4' : 'right-6 top-6',
          )}
          onClick={props.onRequestClose}
          variant={
            hasIntegrations ? ButtonVariant.Tertiary : ButtonVariant.Primary
          }
        />
      )}
      {isLoadingIntegrations && (
        <Modal.Body className="flex items-center justify-center">
          <Loader />
        </Modal.Body>
      )}
      {!isLoadingIntegrations && !hasIntegrations && (
        <SlackIntegrationIntroBody
          headerImg={slackIntegrationHeader}
          onConnect={onConnectNew}
        />
      )}
      {hasIntegrations && (
        <Modal.Body className="flex flex-col gap-4">
          <div className="mr-auto flex w-[calc(100%-40px)] items-center justify-center">
            <SourceAvatar source={source} size={ProfileImageSize.Small} />
            <Typography
              className="flex min-w-0 flex-1 flex-wrap"
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
            >
              <Typography
                className="mr-1"
                tag={TypographyTag.Span}
                bold
                color={TypographyColor.Primary}
                truncate
              >
                {source.name}
              </Typography>
              <Typography
                tag={TypographyTag.Span}
                color={TypographyColor.Tertiary}
                truncate
              >
                {`@${source.handle}`}
              </Typography>
            </Typography>
          </div>
          <Typography
            tag={TypographyTag.H3}
            type={TypographyType.Title2}
            color={TypographyColor.Primary}
            bold
          >
            Configure Integration
          </Typography>
          {!!slackIntegrations?.length && (
            <Dropdown
              placeholder="Select workspace"
              shouldIndicateSelected
              buttonSize={ButtonSize.Medium}
              iconOnly={false}
              selectedIndex={selectedIntegrationIndex}
              renderItem={(value, index) => {
                const currentIntegration = slackIntegrations[index];
                const ItemIcon =
                  currentIntegration.id === 'new' ? PlusIcon : SlackIcon;

                return (
                  <span className="flex gap-2 typo-callout">
                    <ItemIcon />
                    {slackIntegrations[index].name}
                  </span>
                );
              }}
              icon={<SlackIcon />}
              options={slackIntegrations?.map((item) => item.name)}
              onChange={onWorkspaceChange}
              scrollable
            />
          )}
          <div>
            <Typography
              className="mb-2 flex items-center"
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
            >
              Select channels
              {!!channels?.length && (
                <Bubble className="relative ml-1 bg-surface-float px-1">
                  {channels.length}
                </Bubble>
              )}
            </Typography>
            {!!channels?.length && (
              <Dropdown
                placeholder="Select channel"
                shouldIndicateSelected
                buttonSize={ButtonSize.Medium}
                iconOnly={false}
                selectedIndex={selectedChannelIndex}
                renderItem={(_, index) => (
                  <span className="typo-callout">{`#${channels[index].name}`}</span>
                )}
                options={channels?.map((item) => `#${item.name}`)}
                onChange={onChannelChange}
                scrollable
              />
            )}
          </div>
          <Typography
            className="mb-2 flex items-center"
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Can&apos;t find your private channel?
            <a className="ml-1 underline" href={slackIntegration}>
              Read here
            </a>
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            onClick={async (event) => {
              await onSave();

              props.onRequestClose?.(event);
            }}
            loading={isSaving}
          >
            Save
          </Button>
          <Button
            type="button"
            variant={isMobile ? ButtonVariant.Float : ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            onClick={async (event) => {
              await removeSourceIntegration({
                integrationId: selectedIntegration.id,
                sourceId: source.id,
                integrationType: selectedIntegration.type,
              });

              props.onRequestClose?.(event);
            }}
          >
            Remove integration
          </Button>
        </Modal.Body>
      )}
    </Modal>
  );
};

export default SlackIntegrationModal;
