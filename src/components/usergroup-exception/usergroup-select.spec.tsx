import { render, queryByAttribute } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Usergroup } from '@arthrex/models/usergroup';
import { Element, Exception, Option } from '../../models';
import { UsergroupSelect, UsergroupSelectProps } from './usergroup-select';

const exception: Exception = { include: [], exclude: [], whitelist: {} };
const e: Element = {
  value: JSON.stringify(exception),
  disabled: false,
  config: { type: '' },
};

const ug: Usergroup = {
  id: 'ug1',
  name: 'usergroup 1',
  type: 'Security',
};

const getById = queryByAttribute.bind(null, 'id');

const ugOption: Option = { label: 'usergroup 1', value: 'ug1' };

const props: UsergroupSelectProps = {
  element: e,
  values: [],
  include: [],
  exclude: [],
  setInclude: () => undefined,
  setExclude: () => undefined,
};

describe('Usergroup Select', () => {
  beforeEach(() => {
    props.element = e;
    props.values = [];
    props.include = [];
    props.exclude = [];
  });
  it('renders successfully', () => {
    const { queryByText } = render(<UsergroupSelect {...props} />);
    expect(queryByText(/Include:/i)).toBeTruthy();
  });

  it('sets default values successfully', () => {
    props.values = [ug];
    props.include = [ugOption];
    const { queryByText } = render(<UsergroupSelect {...props} />);
    expect(queryByText(/usergroup 1/i)).toBeTruthy();
  });

  it('sets exclude disabled when include has value', () => {
    const newException = { include: ['something'], exclude: [], whitelist: [] };
    const newElement = {
      value: JSON.stringify(newException),
      disabled: false,
      config: { type: '' },
    };
    props.element = newElement;

    const { container } = render(<UsergroupSelect {...props} />);
    const input = getById(container, 'ugExclude');
    expect(input).toBeDisabled();
  });

  it('sets include disabled when exclude has value', () => {
    const newException = { include: [], exclude: ['something'], whitelist: [] };
    const newElement = {
      value: JSON.stringify(newException),
      disabled: false,
      config: { type: '' },
    };
    props.element = newElement;
    const { container } = render(<UsergroupSelect {...props} />);
    const input = getById(container, 'ugInclude');
    expect(input).toBeDisabled();
  });
});
