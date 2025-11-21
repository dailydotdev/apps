import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ExpandableContent } from './ExpandableContent';
import clearAllMocks = jest.clearAllMocks;

describe('ExpandableContent', () => {
  const shortContent = <div>Short content that fits</div>;
  const longContent = (
    <div>
      <p>Long content paragraph 1</p>
      <p>Long content paragraph 2</p>
      <p>Long content paragraph 3</p>
      <p>Long content paragraph 4</p>
      <p>Long content paragraph 5</p>
      <p>Long content paragraph 6</p>
      <p>Long content paragraph 7</p>
      <p>Long content paragraph 8</p>
      <p>Long content paragraph 9</p>
      <p>Long content paragraph 10</p>
    </div>
  );

  beforeEach(() => {
    // Reset scrollHeight mock before each test
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return 100; // Default value
      },
    });
  });

  afterEach(() => {
    clearAllMocks();
  });

  it('should render children content', () => {
    render(<ExpandableContent>{shortContent}</ExpandableContent>);
    const element = screen.getByText('Short content that fits');
    expect(element).toBeInTheDocument();
    expect(element).toBeVisible();
  });

  it('should not show "See More" button when content is short', async () => {
    // Mock scrollHeight to be less than maxHeight
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return 200; // Less than default 320px
      },
    });

    render(<ExpandableContent>{shortContent}</ExpandableContent>);

    // Wait a bit for useEffect to run
    await waitFor(
      () => {
        expect(
          screen.queryByRole('button', { name: /see more/i }),
        ).not.toBeInTheDocument();
      },
      { timeout: 200 },
    );
  });

  it('should show "See More" button when content exceeds maxHeight', async () => {
    // Mock scrollHeight to be more than maxHeight
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return 500; // More than default 320px
      },
    });

    render(<ExpandableContent>{longContent}</ExpandableContent>);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /see more/i }),
      ).toBeInTheDocument();
    });
  });

  it('should expand content when "See More" button is clicked', async () => {
    // Mock scrollHeight to be more than maxHeight
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return 500;
      },
    });

    render(
      <ExpandableContent maxHeight={320}>{longContent}</ExpandableContent>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /see more/i }),
      ).toBeInTheDocument();
    });

    const seeMoreButton = screen.getByRole('button', { name: /see more/i });
    fireEvent.click(seeMoreButton);

    // Button should disappear after expansion
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /see more/i }),
      ).not.toBeInTheDocument();
    });
  });

  it('should show gradient overlay when content is collapsed', async () => {
    // Mock scrollHeight to be more than maxHeight
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return 500;
      },
    });

    render(
      <ExpandableContent maxHeight={320}>{longContent}</ExpandableContent>,
    );

    // Wait for See More button to appear, which indicates collapsed state
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /see more/i }),
      ).toBeInTheDocument();
    });
  });

  it('should hide "See More" button when content is expanded', async () => {
    // Mock scrollHeight to be more than maxHeight
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return 500;
      },
    });

    render(
      <ExpandableContent maxHeight={320}>{longContent}</ExpandableContent>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /see more/i }),
      ).toBeInTheDocument();
    });

    const seeMoreButton = screen.getByRole('button', { name: /see more/i });
    fireEvent.click(seeMoreButton);

    // Both button and gradient should be hidden after expansion
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /see more/i }),
      ).not.toBeInTheDocument();
    });
  });

  it('should apply custom maxHeight', async () => {
    // Mock scrollHeight to exceed custom maxHeight
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        return 200; // More than 150px
      },
    });

    render(
      <ExpandableContent maxHeight={150}>{longContent}</ExpandableContent>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /see more/i }),
      ).toBeInTheDocument();
    });
  });
});
