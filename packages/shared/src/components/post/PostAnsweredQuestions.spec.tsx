import React from 'react';
import { render, screen } from '@testing-library/react';
import { PostAnsweredQuestions } from './PostAnsweredQuestions';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Post } from '../../graphql/posts';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

const answeredQuestions = [
  {
    question: 'What session defaults change in PHP 8.6?',
    answer: 'PHP 8.6 flips three session ini defaults to safer values.',
    cta: 'Teams shipping PHP upgrades track changes like these on daily.dev.',
  },
  {
    question: 'How does partial function application work?',
    answer: 'A ? placeholder prefills arguments and returns a callable.',
    cta: 'Developers adopting new PHP syntax compare usage on daily.dev.',
  },
];

const buildPost = (props: Partial<Post> = {}): Post =>
  ({ id: 'p1', answeredQuestions, ...props } as Post);

const mockAuth = (isLoggedIn: boolean) =>
  jest.mocked(useAuthContext).mockReturnValue({ isLoggedIn } as never);

describe('PostAnsweredQuestions', () => {
  it('renders a collapsed entry per question for anonymous users', () => {
    mockAuth(false);

    render(<PostAnsweredQuestions post={buildPost()} />);

    expect(screen.getByText('Questions this post answers')).toBeInTheDocument();
    const entries = screen.getAllByRole('group');
    expect(entries).toHaveLength(answeredQuestions.length);
    entries.forEach((entry) => expect(entry).not.toHaveAttribute('open'));
  });

  it('keeps the answers in the markup while collapsed so crawlers read them', () => {
    mockAuth(false);

    render(<PostAnsweredQuestions post={buildPost()} />);

    answeredQuestions.forEach(({ question, answer, cta }) => {
      expect(screen.getByText(question)).toBeInTheDocument();
      expect(screen.getByText(`${answer} ${cta}`)).toBeInTheDocument();
    });
  });

  it('omits a missing cta rather than rendering a trailing space', () => {
    mockAuth(false);

    render(
      <PostAnsweredQuestions
        post={buildPost({
          answeredQuestions: [{ ...answeredQuestions[0], cta: '' }],
        })}
      />,
    );

    expect(screen.getByText(answeredQuestions[0].answer)).toBeInTheDocument();
  });

  it('renders nothing for logged in users', () => {
    mockAuth(true);

    const { container } = render(<PostAnsweredQuestions post={buildPost()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the post has no questions', () => {
    mockAuth(false);

    const { container, rerender } = render(
      <PostAnsweredQuestions post={buildPost({ answeredQuestions: null })} />,
    );
    expect(container).toBeEmptyDOMElement();

    rerender(
      <PostAnsweredQuestions post={buildPost({ answeredQuestions: [] })} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
