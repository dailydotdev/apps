import React, { useState } from 'react';
import type { ReactElement } from 'react';
import { Modal } from '../modals/common/Modal';
import { ModalHeader } from '../modals/common/ModalHeader';
import { ModalBody } from '../modals/common/ModalBody';
import { ModalSize } from '../modals/common/types';
import { Switch } from '../fields/Switch';
import { Checkbox } from '../fields/Checkbox';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';

interface Squad {
  id: string;
  name: string;
  handle: string;
  image: string;
  notificationsEnabled: boolean;
}

interface SquadsNotificationsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const SquadsNotificationsModal = ({
  isOpen,
  onRequestClose,
}: SquadsNotificationsModalProps): ReactElement => {
  const [globalNotifications, setGlobalNotifications] = useState(true);

  // Mock data for squads - in real implementation, this would come from props or GraphQL
  const [squads, setSquads] = useState<Squad[]>([
    {
      id: '1',
      name: 'Watercoooler',
      handle: '@handle',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/1',
      notificationsEnabled: true,
    },
    {
      id: '2',
      name: 'global scalable experiences',
      handle: '@handle',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/2',
      notificationsEnabled: true,
    },
    {
      id: '3',
      name: 'deposit Cambridgeshire and',
      handle: '@handle',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/3',
      notificationsEnabled: true,
    },
    {
      id: '4',
      name: 'Granite virtual state',
      handle: '@handle',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/4',
      notificationsEnabled: true,
    },
    {
      id: '5',
      name: 'Facilitator Electronics best-of-breed',
      handle: '@handle',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/5',
      notificationsEnabled: false,
    },
    {
      id: '6',
      name: 'Lilangeni',
      handle: '@handle',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/6',
      notificationsEnabled: true,
    },
    {
      id: '7',
      name: 'Island overriding Agent',
      handle: '@handle',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/7',
      notificationsEnabled: true,
    },
    {
      id: '8',
      name: 'Gorgeous transform cutting-edge',
      handle: '@handle',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/8',
      notificationsEnabled: false,
    },
    {
      id: '9',
      name: 'interface GB capability',
      handle: '@handle',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/9',
      notificationsEnabled: true,
    },
    {
      id: '10',
      name: 'controversy.dev',
      handle: '@handle',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/10',
      notificationsEnabled: true,
    },
    {
      id: '11',
      name: 'Data science',
      handle: '@handle',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/11',
      notificationsEnabled: true,
    },
    {
      id: '12',
      name: 'DevOps',
      handle: '@handle',
      image:
        'https://daily-now-res.cloudinary.com/image/upload/v1/placeholders/12',
      notificationsEnabled: true,
    },
  ]);

  const toggleSquadNotifications = (squadId: string) => {
    setSquads((prevSquads) =>
      prevSquads.map((squad) =>
        squad.id === squadId
          ? { ...squad, notificationsEnabled: !squad.notificationsEnabled }
          : squad,
      ),
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      size={ModalSize.Medium}
      className="w-full max-w-[35rem]"
    >
      <ModalHeader
        className="flex items-center justify-between border-b border-border-subtlest-tertiary"
        title="Squad notifications"
        showCloseButton
      />
      <ModalBody className="gap-5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <h3 className="font-bold text-text-primary typo-callout">
              Notify me about new posts
            </h3>
            <p className="text-text-tertiary typo-footnote">
              Get notified when someone shares a new post in a squad you&apos;ve
              joined. You can control this per squad.
            </p>
          </div>
          <Switch
            inputId="global-squad-notifications"
            name="global-squad-notifications"
            checked={globalNotifications}
            onToggle={() => setGlobalNotifications(!globalNotifications)}
          />
        </div>
        <div className="flex flex-col gap-5">
          {squads.map((squad) => (
            <div key={squad.id} className="flex items-center gap-3">
              <ProfilePicture
                user={{
                  id: squad.id,
                  username: squad.handle,
                  image: squad.image,
                }}
                size={ProfileImageSize.Large}
                className="flex-shrink-0"
              />
              <div className="flex flex-1 flex-col gap-1">
                <h4 className="font-bold text-text-primary typo-footnote">
                  {squad.name}
                </h4>
                <span className="text-text-tertiary typo-caption2">
                  {squad.handle}
                </span>
              </div>
              <Checkbox
                name={`squad-${squad.id}`}
                checked={squad.notificationsEnabled}
                onToggleCallback={() => toggleSquadNotifications(squad.id)}
                className="!pr-0"
                checkmarkClassName="!mr-0"
              />
            </div>
          ))}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default SquadsNotificationsModal;
