import React, { ReactElement } from 'react';
import { NotificationAttachment } from '../../graphql/notifications';
import { cloudinary } from '../../lib/image';
import { Image } from '../image/Image';

function NotificationItemAttachment({
  image,
  title,
}: NotificationAttachment): ReactElement {
  return (
    <div className="flex flex-row items-center p-4 mt-2 rounded-16 border border-theme-divider-tertiary">
      <Image
        src={image}
        alt={`Cover preview of: ${title}`}
        className="object-cover w-24 h-16 rounded-16"
        loading="lazy"
        fallbackSrc={cloudinary.post.imageCoverPlaceholder}
      />
      <span className="flex-1 ml-4 break-words typo-callout">{title}</span>
    </div>
  );
}

export default NotificationItemAttachment;
