interface ElementConfig {
  type: string;
}
/**
 * Custom type for representing the vanilla JS
 * element that gets fed in from Kontent. It contains the
 * disabled state and the current value.
 */
export interface Element {
  config: ElementConfig;
  disabled: boolean;
  value: string;
}

export type CustomElementProps = {
  element: Element;
  api: any;
};
