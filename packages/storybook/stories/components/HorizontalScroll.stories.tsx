import type { Meta, StoryObj } from '@storybook/react';
import HorizontalScroll from '@dailydotdev/shared/src/components/HorizontalScroll/HorizontalScroll';
import React, { ReactElement, useCallback, useState } from 'react';

const ScrollableElement = ({ item, ...props }: {
  item: { value: string }
}): ReactElement => <div {...props} className="m-4 w-full max-w-40 border p-4">{item.value}</div>;

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

// export const HorizontalScrollInfinite: Story = {
//   render: ({ title,  ...props }) => {
//
//     const [data, setData] = useState<Array<{ value: string }>>(
//       new Array(30).fill({ value: 'this is an item' })
//     );
//
//     const loadMoreData = useCallback(() => {
//       setTimeout(() => {
//         setData((prevData) => {
//           if (prevData.length >= 100) {
//             // Limit the number of items to 100
//             return prevData;
//           }
//           // Simulate loading more data
//           return [
//             ...prevData,
//             ...new Array(30).fill({ value: 'this is an item' }),
//           ];
//         });
//       }, 1000); // Simulate a delay in loading data
//     }, []);
//
//     // Event handler for scroll to bottom
//     const handleScroll = (element) => {
//       if (element.scrollLeft + element.clientWidth >= element.scrollWidth) {
//         loadMoreData();
//       }
//     };
//
//     return (
//       <>
//         <HorizontalScroll title={title} onScroll={handleScroll}>
//           {new Array(30).fill({value: "this is an item"}).map((item, i) => (
//             /* eslint-disable react/no-array-index-key */
//             <ScrollableElement
//               {...props}
//               item={item}
//               key={`horizontal scroll item ${i}`}
//             />
//           ))}
//         </HorizontalScroll>
//       </>
//     );
//   },
//   name: 'HorizontalScrollInfinite',
//   args: { title: 'Horizontal Scroll Infinite' },
// };
