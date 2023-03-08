import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedSlider from './FeedSlider';
import FeedContext, {
  defaultFeedContextData,
} from '../../contexts/FeedContext';
import SettingsContext from '../../contexts/SettingsContext';
import { createTestSettings } from '../../../__tests__/fixture/settings';

describe('FeedSlider component', () => {
  const Item = ({ item }) => {
    return <div>Slide {item.id}</div>;
  };
  const defaultItems = [
    {
      id: 'test1',
    },
    {
      id: 'test2',
    },
    {
      id: 'test3',
    },
    {
      id: 'test4',
    },
    {
      id: 'test5',
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    global.ResizeObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  const renderComponent = ({ items }) => {
    return render(
      <FeedContext.Provider
        value={{
          ...defaultFeedContextData,
          numCards: {
            eco: 3,
            roomy: 2,
            cozy: 2,
          },
        }}
      >
        <SettingsContext.Provider value={createTestSettings()}>
          <FeedSlider items={items} Item={Item} />
        </SettingsContext.Provider>
      </FeedContext.Provider>,
    );
  };

  it('should render', async () => {
    const items = [...defaultItems];
    renderComponent({ items });

    const slider = screen.getByTestId('feedSlider');
    defaultItems.forEach((item) => {
      expect(screen.getByText(`Slide ${item.id}`)).toBeInTheDocument();
    });

    const rightControl = screen.queryByTestId('feedSliderControl-right');
    const leftControl = screen.queryByTestId('feedSliderControl-left');

    expect(slider).toBeInTheDocument();
    expect(rightControl).toBeInTheDocument();
    expect(leftControl).not.toBeInTheDocument();
  });

  it('should show left control dynamically if not on first index', async () => {
    const items = [...defaultItems];
    renderComponent({ items });

    let rightControl = screen.queryByTestId('feedSliderControl-right');

    userEvent.click(rightControl);

    let leftControl = screen.queryByTestId('feedSliderControl-left');

    expect(rightControl).toBeInTheDocument();
    expect(leftControl).toBeInTheDocument();

    userEvent.click(leftControl);

    rightControl = screen.queryByTestId('feedSliderControl-right');
    leftControl = screen.queryByTestId('feedSliderControl-left');

    expect(rightControl).toBeInTheDocument();
    expect(leftControl).not.toBeInTheDocument();
  });

  it('should show right control dynamically if on last index', async () => {
    const items = [...defaultItems];
    renderComponent({ items });

    let rightControl = screen.queryByTestId('feedSliderControl-right');

    userEvent.click(rightControl);
    userEvent.click(rightControl);
    userEvent.click(rightControl);
    userEvent.click(rightControl);

    let leftControl = screen.queryByTestId('feedSliderControl-left');
    rightControl = screen.queryByTestId('feedSliderControl-right');

    expect(rightControl).not.toBeInTheDocument();
    expect(leftControl).toBeInTheDocument();

    userEvent.click(leftControl);

    leftControl = screen.queryByTestId('feedSliderControl-left');
    rightControl = screen.queryByTestId('feedSliderControl-right');

    expect(rightControl).toBeInTheDocument();
    expect(leftControl).toBeInTheDocument();
  });

  it('should not render if 0 items', async () => {
    const items = [];
    renderComponent({ items });

    const slider = screen.queryByTestId('feedSlider');

    expect(slider).not.toBeInTheDocument();
  });

  it('should not render controls if single item', async () => {
    const items = [defaultItems[0]];
    renderComponent({ items });

    const rightControl = screen.queryByTestId('feedSliderControl-right');
    const leftControl = screen.queryByTestId('feedSliderControl-left');

    expect(rightControl).not.toBeInTheDocument();
    expect(leftControl).not.toBeInTheDocument();
  });
});
