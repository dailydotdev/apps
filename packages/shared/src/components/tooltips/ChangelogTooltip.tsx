import React, {
  MutableRefObject,
  ReactElement,
  useCallback,
  useContext,
} from 'react';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { BaseTooltip } from './BaseTooltip';
import { Button } from '../buttons/Button';
import { ModalClose } from '../modals/common/ModalClose';
import styles from './ChangelogTooltip.module.css';
import { FeedData, Post } from '../../graphql/posts';
import { SOURCE_FEED_QUERY } from '../../graphql/feed';
import { graphqlUrl } from '../../lib/config';
import AuthContext from '../../contexts/AuthContext';
import { cloudinary } from '../../lib/image';
import { postDateFormat } from '../../lib/dateFormat';
import { Image } from '../image/Image';

interface ChangelogTooltipProps<TRef> {
  elementRef: MutableRefObject<TRef>;
  onRequestClose?: (e?: React.MouseEvent | React.KeyboardEvent) => void;
}

function ChangelogTooltip<TRef extends HTMLElement>({
  elementRef,
  onRequestClose,
}: ChangelogTooltipProps<TRef>): ReactElement {
  // TODO WT-1054-changelog test extension
  const isExtension = true; // !!process.env.TARGET_BROWSER;
  const { user } = useContext(AuthContext);
  const { data: post } = useQuery<FeedData, unknown, Post>(
    [
      'changelog',
      'latest-post',
      {
        source: 'daily_updates',
        first: 1,
        loggedIn: !!user?.id,
        unreadOnly: false,
      },
    ],
    async ({ queryKey }) => {
      const [, , variables] = queryKey;

      return await request(graphqlUrl, SOURCE_FEED_QUERY, variables);
    },
    {
      select: useCallback((data) => {
        return data?.page.edges[0]?.node;
      }, []),
    },
  );

  return (
    <BaseTooltip
      content={
        !!post && (
          <div className="flex flex-col w-96 whitespace-normal break-words rounded-16 border shadow-2 focus:outline-none changelog bg-theme-bg-tertiary border-theme-color-cabbage">
            <header className="flex flex-1 items-center py-3 px-4 border-b border-theme-divider-tertiary">
              <Button className="bg-water-40 btn-primary small text-theme-label-secondary">
                New release
              </Button>
              {onRequestClose && <ModalClose onClick={onRequestClose} />}
            </header>
            <section className="flex flex-col flex-1 p-5 h-full shrink max-h-full">
              <Image
                className="object-cover w-44 h-28 rounded-lg"
                alt="Post Cover image"
                src={post.image}
                fallbackSrc={cloudinary.post.imageCoverPlaceholder}
                loading="lazy"
              />
              <h3 className="mt-2 font-bold text-theme-label-primary typo-title3">
                {post.title}
              </h3>
              <time
                className="text-theme-label-quaternary typo-callout"
                dateTime={post.createdAt}
              >
                {postDateFormat(post.createdAt)}
              </time>
              <div className="mt-2 w text-theme-label-tertiary typo-callout">
                {post.summary}
              </div>
            </section>
            <footer className="flex gap-3 items-center py-3 px-4 w-full h-16 border-t border-theme-divider-tertiary">
              <Button className="btn-tertiary">Release notes</Button>
              {isExtension && (
                <Button className="bg-cabbage-40 btn-primary">
                  Update extension
                </Button>
              )}
            </footer>
          </div>
        )
      }
      offset={[6 * 16, 2.5 * 16]}
      interactive
      container={{
        className: 'shadow',
        paddingClassName: 'p-0',
        roundedClassName: 'rounded-16',
        bgClassName: 'bg-cabbage-40',
        arrowClassName: styles.changelogTooltipArrow,
      }}
      reference={elementRef}
      arrow
      placement="right-end"
      visible={!!post}
    />
  );
}

export default ChangelogTooltip;
