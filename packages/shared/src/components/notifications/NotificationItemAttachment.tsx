import React, { ReactElement } from 'react';

export interface NotificationItemAttachmentProps {
  image: string;
  title: string;
}

function NotificationItemAttachment({
  image,
  title,
}: NotificationItemAttachmentProps): ReactElement {
  return (
    <div className="flex flex-row items-center p-4 mt-2 rounded-16 border border-theme-divider-tertiary">
      <img
        className="object-cover w-24 h-16 rounded-16"
        src={image}
        alt={`Preview cover of the article: ${title}`}
      />
      <span className="flex-1 ml-4 break-words typo-callout">{title}</span>
    </div>
  );
}

export default NotificationItemAttachment;
