export const CATEGORIES = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Social',
  'Startup',
  'Academic',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];
