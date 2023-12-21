import React, { ReactElement } from 'react';
import {
  NotificationAttachment,
  NotificationAttachmentType,
} from '../../graphql/notifications';
import { cloudinary } from '../../lib/image';
import { Image } from '../image/Image';
import VideoImage from '../image/VideoImage';
import { IconSize } from '../Icon';

function NotificationItemAttachment({
  image,
  title,
  type,
}: NotificationAttachment): ReactElement {
  const ImageComponent =
    type === NotificationAttachmentType.Video ? VideoImage : Image;

  return (
    <div className="flex flex-row items-center p-4 mt-2 rounded-16 border border-theme-divider-tertiary">
      <div>
        <ImageComponent
          src={image}
          alt={`Cover preview of: ${title}`}
          className="object-cover w-24 h-16 rounded-16"
          loading="lazy"
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          {...(type === NotificationAttachmentType.Video && {
            size: IconSize.XLarge,
          })}
        />
      </div>
      <span className="flex-1 ml-4 break-words typo-callout">{title}</span>
    </div>
  );
}

export default NotificationItemAttachment;
