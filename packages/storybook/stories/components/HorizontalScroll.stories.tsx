import type { Meta, StoryObj } from '@storybook/react';
import HorizontalScroll from '@dailydotdev/shared/src/components/HorizontalScroll/HorizontalScroll';
import React, {
  ReactElement,
  Ref,
  RefObject,
  useCallback,
  useState,
} from 'react';

const ScrollableElement = ({ item, index, ...props }: {
  item: { value: string },
  index: number
}): ReactElement => <div {...props} className="m-4 w-full max-w-40 border p-4">{item.value} {index}</div>;

const meta: Meta<typeof HorizontalScroll> = {
  title: 'Components/HorizontalScroll',
  component: HorizontalScroll,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  argTypes: {
    title: {
      control: { type: "text" },
      description: 'When this property is not null, a title bar will be rendered with this value',
    },
  },
};

export default meta;

type Story = StoryObj<typeof HorizontalScroll>;

export const HorizontalScrollStory: Story = {
  render: ({ title,  ...props }) => {

    return (
      <>
        <HorizontalScroll title={title}>
          {new Array(30).fill({value: "this is an item"}).map((item, i) => (
            /* eslint-disable react/no-array-index-key */
            <ScrollableElement
              {...props}
              item={item}
              index={i}
              key={`horizontal scroll item ${i}`}
            />
          ))}
        </HorizontalScroll>
      </>
    );
  },
  name: 'HorizontalScroll',
  args: { title: 'Horizontal Scroll' },
};

export const HorizontalScrollInfinite: Story = {
  render: ({ title,  ...props }) => {

    const [data, setData] = useState<Array<{ value: string }>>(
      new Array(30).fill({ value: 'this is an item' })
    );

    const loadMoreData = useCallback(() => {
      setTimeout(() => {
        setData((prevData) => {
          if (prevData.length >= 100) {
            // Limit the number of items to 100
            return prevData;
          }
          // Simulate loading more data
          return [
            ...prevData,
            ...new Array(30).fill({ value: 'this is an item' }),
          ];
        });
      }, 1000); // Simulate a delay in loading data
    }, []);

    // Event handler for scroll to near the end
    const handleScroll = (scrollingRef: RefObject<HTMLElement>) => {
      const element = scrollingRef?.current;
      if(element) {
        const threshold = element.scrollWidth * 0.8; // Load more data when 80% of the scroll is reached

        if (element.scrollLeft + element.clientWidth >= threshold) {
          loadMoreData();
        }
      }

    };

    return (
      <>
        <HorizontalScroll
          title={title}
          onScroll={handleScroll}
          onClickSeeAll={() => console.log("See all clicked")}
        >
          {data.map((item, i) => (
            /* eslint-disable react/no-array-index-key */
            <ScrollableElement
              {...props}
              item={item}
              index={i}
              key={`horizontal scroll item ${i}`}
            />
          ))}
        </HorizontalScroll>
      </>
    );
  },
  name: 'HorizontalScrollInfinite',
  args: { title: 'Horizontal Scroll Infinite' },
};
