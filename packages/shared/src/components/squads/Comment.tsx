import React, {
  FormEvent,
  KeyboardEvent,
  ReactElement,
  useContext,
  useState,
} from 'react';
import { Modal } from '../modals/common/Modal';
import { Button } from '../buttons/Button';
import { ProfilePicture } from '../ProfilePicture';
import { Justify } from '../utilities';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import AuthContext from '../../contexts/AuthContext';
import OpenLinkIcon from '../icons/OpenLink';
import { SquadForm } from '../../graphql/squads';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { KeyboardCommand } from '../../lib/element';

interface SquadCommentProps {
  onSubmit: (
    e?: React.MouseEvent | React.KeyboardEvent,
    commentary?: string,
  ) => unknown;
  form: Partial<SquadForm>;
  isLoading?: boolean;
}

export function SquadComment({
  onSubmit,
  form,
  isLoading,
}: SquadCommentProps): ReactElement {
  const { post } = form.post;
  const { user } = useContext(AuthContext);
  const [commentary, setCommentary] = useState(form.commentary);

  const handleKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const pressedSpecialkey = e.ctrlKey || e.metaKey;
    if (
      pressedSpecialkey &&
      e.key === KeyboardCommand.Enter &&
      commentary?.length
    ) {
      onSubmit(null, commentary);
    }
  };

  return (
    <>
      <Modal.Body className="flex flex-col">
        <form
          onSubmit={onSubmit as React.EventHandler<FormEvent>}
          className="flex flex-1 gap-4"
          id="squad-comment"
        >
          <ProfilePicture user={user} />
          <textarea
            placeholder="Share your thought and insights about the post…"
            className="flex-1 self-stretch w-full min-w-0 focus:placeholder-transparent bg-transparent focus:outline-none resize-none typo-body caret-theme-label-link text-theme-label-primary"
            value={commentary}
            onKeyDown={handleKeydown}
            onChange={(event) => setCommentary(event.target.value)}
            ref={(el) => {
              if (!el) return;

              el.focus();
            }}
          />
        </form>
        <div className="flex gap-4 items-center py-2 px-4 w-full rounded-12 border border-theme-divider-tertiary">
          <p className="flex-1 line-clamp-3 multi-truncate text-theme-label-secondary typo-caption1">
            {post.title}
          </p>
          <Image
            src={post.image}
            className="object-cover w-16 laptop:w-24 h-16 rounded-16"
            loading="lazy"
            fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          />
          <a href={post.permalink} target="_blank">
            <OpenLinkIcon />
          </a>
        </div>
      </Modal.Body>
      <Modal.Footer justify={Justify.Between}>
        <div className="flex">
          <Image
            className="object-cover mr-3 w-8 h-8 rounded-full"
            src={form.file ?? cloudinary.squads.imageFallback}
          />
          <div>
            <h5 className="font-bold typo-caption1">{form.name}</h5>
            <h6 className="typo-caption1 text-theme-label-tertiary">
              @{form.handle}
            </h6>
          </div>
        </div>
        <SimpleTooltip
          placement="left"
          disabled={!!commentary}
          content="Please add a comment before proceeding"
        >
          <div>
            <Button
              form="squad-comment"
              className="btn-primary-cabbage"
              type="submit"
              loading={isLoading}
              disabled={!commentary || isLoading}
            >
              Done
            </Button>
          </div>
        </SimpleTooltip>
      </Modal.Footer>
    </>
  );
}
