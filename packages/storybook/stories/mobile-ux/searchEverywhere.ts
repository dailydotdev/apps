// Every search a member can reach on a phone (2026-09-29 code inventory)
// and the one behaviour proposed for all of them.

export enum SearchShape {
  Field = 'Field above the bar',
  Button = 'Button in the top row',
  None = 'No search',
}

export interface SearchRow {
  page: string;
  today: string;
  shape: SearchShape;
  placeholder: string;
  behaviour: string;
}

export const searchRows: SearchRow[] = [
  { page: 'Explore', today: 'A sticky "Search" pill (SpotlightTrigger, 48px) at the top, full width; opens Spotlight', shape: SearchShape.Field, placeholder: 'Search posts, tags, sources, people', behaviour: 'Opens Spotlight as the full page (chapter 3c). The one global search.' },
  { page: 'Search results', today: 'The same pill, which reopens Spotlight with an empty input; a Filters button', shape: SearchShape.Field, placeholder: 'the query', behaviour: 'The field shows the query and reopens Spotlight with it filled in; Filters stays a floating button.' },
  { page: 'Tags directory', today: 'A 48px "Search all tags" field inline in the hero, scrolls away; client filter, hides the A to Z while typing', shape: SearchShape.Field, placeholder: 'Search tags', behaviour: 'Filters the directory in place as you type; the A to Z row hides while a query is set; the query is in the URL.' },
  { page: 'Sources directory', today: 'None', shape: SearchShape.Field, placeholder: 'Search sources', behaviour: 'Filters in place. New; the directory is a searchable list like tags.' },
  { page: 'Leaderboard', today: 'None', shape: SearchShape.None, placeholder: '', behaviour: 'A ranked list you scan, not search. Spotlight finds people.' },
  { page: 'Squads root', today: 'None on the directory', shape: SearchShape.Field, placeholder: 'Search squads', behaviour: 'Filters Your squads and Discover in place; the category chips hide while a query is set.' },
  { page: 'Squad page', today: 'A search icon in the header row; opens Spotlight scoped to the squad; results show a query chip with a clear', shape: SearchShape.Button, placeholder: 'Search React Israel', behaviour: 'The button in the top row opens the field above the keyboard; results replace the Posts segment with the query shown in the field and a clear control.' },
  { page: 'Squad members', today: 'A 48px field under the tab pills: Search members / moderators / blocked', shape: SearchShape.Field, placeholder: 'Search members', behaviour: 'Filters the active segment; the text carries over between segments as today.' },
  { page: 'Bookmarks', today: 'A 40px "Search bookmarks" field inline under the title beside sort, share and the folder menu; suggestions as you type; ?q= on Enter', shape: SearchShape.Field, placeholder: 'Search bookmarks', behaviour: 'Searches the active list (Quick saves, Read it later, a folder); suggestions as you type; ?q= in the URL.' },
  { page: 'History', today: 'A 40px "Search reading history" field at the top of the list; the field disappears when a query has no results', shape: SearchShape.Field, placeholder: 'Search history', behaviour: 'Same as Bookmarks; the field never disappears, the empty state sits above it.' },
  { page: 'Following', today: 'None', shape: SearchShape.Button, placeholder: 'Search following', behaviour: 'Filters the list of sources, squads and people you follow. Secondary on this page, so a button.' },
  { page: 'Activity', today: 'None', shape: SearchShape.None, placeholder: '', behaviour: 'The type chips are the filter.' },
  { page: 'Home', today: 'None (the strip has no search)', shape: SearchShape.None, placeholder: '', behaviour: 'Decided in round 4: no search icon on Home; Explore is one tap away.' },
  { page: 'Profile, tag, source, post', today: 'None', shape: SearchShape.None, placeholder: '', behaviour: 'Nothing to search on the page; Spotlight finds everything.' },
  { page: 'Feed settings: Tags, Sources, Blocked', today: 'A borderless field first in each section: Search all tags / sources, squads, or users / sources, squads, users, or tags', shape: SearchShape.Field, placeholder: 'Search tags', behaviour: 'The settings page is a searchable list, so the same field above the bar, filtering the section in place.' },
  { page: 'Onboarding tags', today: 'A field above the tag cloud; autofocus only from tablet up', shape: SearchShape.Field, placeholder: 'Search javascript, php, git…', behaviour: 'Same field, above the funnel’s own bottom button instead of the tab bar; the funnel has no cluster.' },
  { page: 'Pickers and forms', today: 'GIF, emoji, skills, city, gift recipient inputs inside sheets and forms', shape: SearchShape.None, placeholder: '', behaviour: 'Inputs inside a sheet or form keep their inline field; they are not page search.' },
];

export const searchRules: [string, string][] = [
  ['One field, one place', 'Page search is the floating field above the tab bar, the same component as Explore’s: 52px at rest in our rectangle radius, compact while scrolling as the tab bar slides away, back when you scroll up. Never a field in the hero or under a title.'],
  ['Field when the page is a list you search', 'Explore, Tags, Sources, Squads root, Bookmarks, History, Members, Feed settings sections. If a member would open the page to find something in it, the field is there at rest.'],
  ['Button when search is one action among others', 'Squad page, Following. A search icon in the top row (the same 38px button as every action) opens the same field above the keyboard; the field then stays above the bar with the query and a clear control.'],
  ['No search when there is nothing to search', 'Home, Activity, Leaderboard, profile, tag, source and post pages. Spotlight on Explore covers finding people, tags and sources from anywhere.'],
  ['Tap: field rises to the keyboard', 'Tapping the field (or the button) focuses it and it rides above the keyboard on visualViewport; the list filters as you type; the tab bar hides while the keyboard is up. Explore is the one exception: its field opens Spotlight.'],
  ['The query lives in the URL', 'Every page search sets ?q= (shallow) so back, refresh and share keep it; the field shows the query and a clear control; the empty state never removes the field.'],
  ['Placeholders name the list', '"Search tags", "Search squads", "Search bookmarks", "Search members", "Search React Israel"; Explore keeps "Search posts, tags, sources, people".'],
];
