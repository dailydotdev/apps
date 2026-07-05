import type { ReactElement } from 'react';
import React from 'react';
import type { LiveRoomContextValue } from '../../contexts/LiveRoomContext';
import { Modal } from '../modals/common/Modal';
import {
  AUDIO_ONLY_LABEL,
  MicSettingRow,
  SelectSettingRow,
  VIDEO_QUALITY_ITEMS,
  VIDEO_QUALITY_LABEL,
} from './LiveRoomControlPrimitives';

interface LiveRoomSettingsModalProps {
  videoSettings: LiveRoomContextValue['videoSettings'];
  setVideoSetting: LiveRoomContextValue['setVideoSetting'];
  onClose: () => void;
  onTrackSettingChange: (
    targetId: string,
    surface: 'settings_modal',
    value: unknown,
  ) => void;
}

export const LiveRoomSettingsModal = ({
  videoSettings,
  setVideoSetting,
  onClose,
  onTrackSettingChange,
}: LiveRoomSettingsModalProps): ReactElement => (
  <Modal
    isOpen
    kind={Modal.Kind.FixedCenter}
    size={Modal.Size.Small}
    isDrawerOnMobile
    drawerProps={{ appendOnRoot: true }}
    onRequestClose={onClose}
  >
    <Modal.Header title="Standup settings" />
    <Modal.Body className="gap-1">
      <SelectSettingRow
        label={VIDEO_QUALITY_LABEL}
        description="Choose how aggressively remote video should use your connection."
        value={videoSettings.quality}
        options={VIDEO_QUALITY_ITEMS.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
        onSelect={(quality) => {
          setVideoSetting('quality', quality);
          onTrackSettingChange('video_quality', 'settings_modal', quality);
        }}
      />
      <MicSettingRow
        id="live-room-video-setting-audio-only"
        label={AUDIO_ONLY_LABEL}
        description="Hide remote video and keep the standup playing through audio."
        checked={videoSettings.audioOnly}
        onToggle={() => {
          const nextValue = !videoSettings.audioOnly;
          setVideoSetting('audioOnly', nextValue);
          onTrackSettingChange('audio_only', 'settings_modal', nextValue);
        }}
      />
    </Modal.Body>
  </Modal>
);
