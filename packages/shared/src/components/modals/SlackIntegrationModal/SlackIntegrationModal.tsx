import React, { ReactElement } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { Dropdown } from '../../fields/Dropdown';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Button } from '../../buttons/Button';
import { useViewSize, ViewSize } from '../../../hooks';
import { Source } from '../../../graphql/sources';
import { SourceAvatar } from '../../profile/source';
import { ProfileImageSize } from '../../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { PlusIcon, SlackIcon } from '../../icons';
import { useIntegration } from '../../../hooks/integrations/useIntegration';
import { useThemedAsset } from '../../../hooks/utils';
import { Loader } from '../../Loader';
import { ModalClose } from '../common/ModalClose';
import { SlackIntegrationIntroBody } from './SlackIntegrationIntroBody';
import { useSlackIntegrationModal } from './useSlackIntegrationModal';

export type SlackIntegrationModalProps = Omit<ModalProps, 'children'> & {
  source: Pick<Source, 'id' | 'handle' | 'type' | 'image' | 'name'>;
};

const SlackIntegrationModal = ({
  source,
  ...props
}: SlackIntegrationModalProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { removeSourceIntegration } = useIntegration();

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
  } = useSlackIntegrationModal({ source });

  const hasIntegrations = !!slackIntegrations?.length && !isLoadingIntegrations;

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
          className="top-4"
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
          <div className="mr-auto flex items-center justify-center">
            <SourceAvatar source={source} size={ProfileImageSize.Small} />
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
            >
              <Typography
                tag={TypographyTag.Span}
                bold
                color={TypographyColor.Primary}
              >
                {source.name}
              </Typography>{' '}
              <Typography
                tag={TypographyTag.Span}
                color={TypographyColor.Tertiary}
              >
                @{source.handle}
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
              key="feed"
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
                <Typography
                  className="ml-1 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-surface-float p-0.5"
                  tag={TypographyTag.Span}
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  {channels.length}
                </Typography>
              )}
            </Typography>
            {!!channels?.length && (
              <Dropdown
                placeholder="Select channel"
                shouldIndicateSelected
                buttonSize={ButtonSize.Medium}
                iconOnly={false}
                key="feed"
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