import React, { ReactElement, useContext } from 'react';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../typography/Typography';
import { FeedOrder, feedRangeFilters } from '../../../../lib/constants';
import { Dropdown } from '../../../fields/Dropdown';
import { Radio } from '../../../fields/Radio';
import { TextField } from '../../../fields/TextField';
import { EyeIcon, FlagIcon, UpvoteIcon } from '../../../icons';
import { Checkbox } from '../../../fields/Checkbox';
import { IconSize } from '../../../Icon';

export const FeedSettingsFiltersSection = (): ReactElement => {
  const { setData, data, feed } = useContext(FeedSettingsEditContext);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Body}>
            Set default sorting
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Choose how posts are ordered in your feed.
          </Typography>
        </div>
        <Dropdown
          className={{
            container: 'w-full tablet:max-w-70',
          }}
          selectedIndex={Math.max(
            Object.values(FeedOrder).indexOf(data.orderBy),
            0,
          )}
          options={Object.keys(FeedOrder)}
          onChange={(_, index) => {
            const newOrderBy = Object.values(FeedOrder)[index];

            setData({
              orderBy: newOrderBy === FeedOrder.Recommended ? null : newOrderBy,
            });
          }}
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Body}>
            Filter by time range
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Include only posts published within a specific time range.
          </Typography>
        </div>
        <Radio
          name="feedminDayRange"
          options={feedRangeFilters}
          value={data.minDayRange?.toString() || null}
          onChange={(value) => {
            setData({ minDayRange: +value || null });
          }}
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography bold type={TypographyType.Body}>
            Set content thresholds
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Define the minimum upvotes or views posts need to appear in your
            feed.
          </Typography>
        </div>
        <div className="flex flex-wrap gap-4">
          <TextField
            hintIcon={<FlagIcon secondary size={IconSize.Size16} />}
            hint={
              data?.minUpvotes < 0 || data?.minUpvotes > 1000
                ? 'Min upvotes must be between 0 and 1000'
                : ''
            }
            className={{
              container: 'w-full tablet:max-w-70',
            }}
            leftIcon={<UpvoteIcon />}
            defaultValue={feed.flags?.minUpvotes}
            name="feedMinUpvotes"
            type="number"
            inputId="feedMinUpvotes"
            label="Min upvotes"
            placeholder="No limit"
            required
            min={0}
            max={1000}
            valueChanged={(value) => setData({ minUpvotes: +value })}
          />
          <TextField
            hintIcon={<FlagIcon secondary size={IconSize.Size16} />}
            hint={
              data?.minViews < 0 || data?.minViews > 1000
                ? 'Min views must be between 0 and 1000'
                : ''
            }
            className={{
              container: 'w-full tablet:max-w-70',
            }}
            leftIcon={<EyeIcon />}
            defaultValue={feed.flags?.minViews}
            name="feedMinViews"
            type="number"
            inputId="feedMinViews"
            label="Min views"
            placeholder="No limit"
            required
            min={0}
            max={1000}
            valueChanged={(value) => setData({ minViews: +value })}
          />
        </div>
      </div>
      <Checkbox
        name="feedDisableEngagementFilter"
        checked={data.disableEngagementFilter}
        onToggleCallback={(value) =>
          setData({ disableEngagementFilter: value })
        }
      >
        Include posts I&apos;ve interacted with before
      </Checkbox>
    </>
  );
};
