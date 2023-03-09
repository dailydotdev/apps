import React, {
  FormEvent,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useMutation } from 'react-query';
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
import { isNullOrUndefined } from '../../lib/func';
import { TextField } from '../fields/TextField';
import LinkIcon from '../icons/Link';
import { getPostByUrl, Post } from '../../graphql/posts';
import { ApiError, ApiErrorResult } from '../../graphql/common';
import useDebounce from '../../hooks/useDebounce';

interface SquadCommentProps {
  onSubmit: React.EventHandler<FormEvent>;
  form: Partial<SquadForm>;
  isLoading?: boolean;
  onUpdateForm?: (post: Post) => void;
}

export function SquadComment({
  onSubmit,
  form,
  isLoading,
  onUpdateForm,
}: SquadCommentProps): ReactElement {
  const textinput = useRef<HTMLTextAreaElement>();
  const { url, post: postItem } = form;
  const { post } = postItem;
  const { user } = useContext(AuthContext);
  const [commentary, setCommentary] = useState(form.commentary);
  const isLink = !isNullOrUndefined(url);
  const { mutateAsync: getPost } = useMutation(
    (param: string) => {
      if (!param) return null;

      return getPostByUrl(param);
    },
    {
      onSuccess: (postByUrl) => {
        if (postByUrl) {
          onUpdateForm(postByUrl);
        }
      },
      onError: (err: ApiErrorResult) => {
        if (err?.response?.errors?.[0].extensions.code === ApiError.NotFound) {
          onUpdateForm(null);
        }
      },
    },
  );
  const [checkUrl] = useDebounce(getPost, 200);

  useEffect(() => {
    textinput?.current?.focus?.();
  }, []);

  return (
    <>
      <Modal.Body className="flex flex-col">
        <form
          onSubmit={onSubmit}
          className="flex flex-col flex-1"
          id="squad-comment"
        >
          <span className="flex flex-row flex-1 gap-4">
            <ProfilePicture user={user} />
            <textarea
              placeholder="Share your thought and insights about the post…"
              className="flex-1 self-stretch w-full min-w-0 focus:placeholder-transparent bg-transparent focus:outline-none resize-none typo-body caret-theme-label-link text-theme-label-primary"
              value={commentary}
              onChange={(event) => setCommentary(event.target.value)}
              ref={textinput}
            />
          </span>
          {isLink && !post && (
            <TextField
              leftIcon={<LinkIcon />}
              label="Enter link to share"
              fieldType="tertiary"
              inputId="url"
              name="url"
              type="url"
              required
              defaultValue={url}
              onInput={(e) => checkUrl(e.currentTarget.value)}
            />
          )}
          {post && (
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
          )}
        </form>
      </Modal.Body>
      <Modal.Footer justify={Justify.Between}>
        <div className="flex">
          <Image
            className="mr-3 h-8 rounded-full"
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
