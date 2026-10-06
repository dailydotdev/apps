import React from 'react';
import type { GetServerSidePropsContext } from 'next';
import { render, screen } from '@testing-library/react';
import YouTubeEmbed, {
  getServerSideProps,
} from '../pages/embed/youtube/[videoId]';

it.each(['1', '0', undefined])(
  'preserves the extension autoplay choice (%s) through the embed page',
  async (autoplay) => {
    const result = await getServerSideProps({
      params: { videoId: 'A5z3m2W0JXo' },
      query: { autoplay },
      res: { setHeader: jest.fn() },
    } as unknown as GetServerSidePropsContext);

    if (!('props' in result)) {
      throw new Error('Expected embed page props');
    }

    render(<YouTubeEmbed {...await result.props} />);
    expect(screen.getByTitle('YouTube video player')).toHaveAttribute(
      'src',
      `https://www.youtube-nocookie.com/embed/A5z3m2W0JXo${
        autoplay === '1' ? '?autoplay=1' : ''
      }`,
    );
  },
);
