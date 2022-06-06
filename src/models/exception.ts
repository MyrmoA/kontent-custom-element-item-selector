/**
 * This is the main data model that Kontent will return
 * from the geographic exception and usergroup exception components.
 * It consists of an inclusion/exclusion list and a whitelist.
 * The inclusion/exclusion list will be exposed to the
 * user for manipulation, and the whitelist will be calculated based on those
 * inclusion/exclusion lists intersected with the overall options.
 */
export type Whitelist = {
  [key: string]: boolean;
};
export interface Exception {
  include: string[];
  exclude: string[];
  whitelist: Whitelist;
}
