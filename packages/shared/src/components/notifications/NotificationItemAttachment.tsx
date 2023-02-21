import React, { ReactElement } from 'react';
import { NotificationAttachment } from '../../graphql/notifications';

function NotificationItemAttachment({
  image,
  title,
}: NotificationAttachment): ReactElement {
  return (
    <div className="mt-2 flex flex-row items-center rounded-16 border border-theme-divider-tertiary p-4">
      <img
        className="h-16 w-24 rounded-16 object-cover"
        src={image}
        alt={`Cover preview of: ${title}`}
      />
      <span className="ml-4 flex-1 break-words typo-callout">{title}</span>
    </div>
  );
}

export default NotificationItemAttachment;
