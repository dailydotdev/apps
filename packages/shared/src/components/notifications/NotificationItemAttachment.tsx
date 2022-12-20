import React, { ReactElement } from 'react';
import { NotificationAttachment } from '../../graphql/notifications';

function NotificationItemAttachment({
  image,
  title,
}: NotificationAttachment): ReactElement {
  return (
    <div className="flex flex-row items-center p-4 mt-2 rounded-16 border border-theme-divider-tertiary">
      <img
        className="object-cover w-24 h-16 rounded-16"
        src={image}
        alt={`Cover preview of: ${title}`}
      />
      <span className="flex-1 ml-4 break-words typo-callout">{title}</span>
    </div>
  );
}

export default NotificationItemAttachment;
