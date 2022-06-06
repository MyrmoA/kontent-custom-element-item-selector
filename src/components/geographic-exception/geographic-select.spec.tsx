import { fireEvent, getByText, render } from '@testing-library/react';
import { Country } from '@arthrex/models/country';
import { Element, Exception, Option } from '../../models';
import { GeographicSelect, GeographicSelectProps } from './geographic-select';

const exception: Exception = { include: [], exclude: [], whitelist: {} };
const e: Element = {
  value: JSON.stringify(exception),
  disabled: false,
  config: { type: '' },
};

const us: Country = {
  id: 'us',
  name: 'united states',
  geo_data: '',
  restrictions: [],
};

const ca: Country = {
  id: 'ca',
  name: 'canada',
  geo_data: '',
  restrictions: [],
};

const caOption: Option = { label: 'canada', value: 'ca' };

const props: GeographicSelectProps = {
  element: e,
  values: [],
  include: [],
  exclude: [],
  setInclude: () => undefined,
  setExclude: () => undefined,
};

export function openMenu(container: HTMLElement) {
  const placeholder = getByText(container, 'Select...');
  fireEvent.keyDown(placeholder, {
    key: 'ArrowDown',
  });
}

describe('Geographic Select', () => {
  beforeEach(() => {
    props.element = e;
    props.values = [];
    props.include = [];
    props.exclude = [];
  });

  it('renders successfully', () => {
    const { queryByText } = render(<GeographicSelect {...props} />);
    expect(queryByText(/Include:/i)).toBeTruthy();
  });

  it('sets default values successfully', () => {
    props.values = [ca, us];
    props.include = [caOption];
    const { queryByText, getByText } = render(<GeographicSelect {...props} />);
    expect(getByText(/canada/i)).toBeTruthy();
    expect(queryByText(/united states/i)).toBeNull();
  });

  it('contains the correct options', async () => {
    props.values = [ca, us];
    const { queryByText, getByTestId, findByText } = render(
      <GeographicSelect {...props} />
    );

    const canada = /canada/;
    const unitedStates = /united states/;
    const includeSelect = getByTestId(/include/);
    const excludeSelect = getByTestId(/exclude/);

    expect(queryByText(canada)).toBeNull();
    expect(queryByText(unitedStates)).toBeNull();
    openMenu(includeSelect);
    const caDiv = await findByText(canada);
    expect(canada).toBeTruthy();
    expect(queryByText(unitedStates)).toBeTruthy();
    fireEvent.click(caDiv);

    // After clicking a value, upon reopening the menu, that value
    // should no longer be in the list
    openMenu(includeSelect);
    const usDiv = await findByText(unitedStates);
    expect(queryByText(canada)).toBeNull();
    expect(usDiv).toBeTruthy();
    // We need to close the menu before checking the exclusion select dropdown
    fireEvent.keyDown(usDiv, { key: 'Escape' });

    // The clicked value should also be gone from the opposing select options
    openMenu(excludeSelect);
    expect(queryByText(canada)).toBeNull();
    expect(queryByText(unitedStates)).toBeTruthy();
  });
});
