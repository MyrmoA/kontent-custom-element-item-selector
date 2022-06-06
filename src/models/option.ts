/**
 * Option is the interface for displaying values in
 * react-select. Kontent Models need to be converted to/from
 * this interface in order to be represented via the dropdowns.
 */
export interface Option {
  value: string;
  label: string;
}
