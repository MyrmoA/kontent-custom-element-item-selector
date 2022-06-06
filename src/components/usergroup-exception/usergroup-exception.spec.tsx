import { fireEvent, render } from '@testing-library/react';
import { Element, Exception } from '../../models';
import {
  UsergroupException,
  UsergroupExceptionProps,
} from './usergroup-exception';
import '@testing-library/jest-dom';
import { usergroups } from '@arthrex/models/usergroup';

const exception: Exception = { include: [], exclude: [], whitelist: {} };
const element: Element = {
  value: JSON.stringify(exception),
  disabled: false,
  config: { type: '' },
};
const props: UsergroupExceptionProps = {
  element: element,
  api: undefined,
};

describe('Usergroup Exception', () => {
  beforeEach(() => {
    props.element = element;
  });
  it('renders successfully', async () => {
    const { findByText } = render(<UsergroupException {...props} />);
    expect(await findByText(/Usergroups:/i)).toBeTruthy();
  });

  it('sets default values successfully', () => {
    const e: Exception = {
      include: ['test_usergroup'],
      exclude: [],
      whitelist: {},
    };
    props.element = {
      value: JSON.stringify(e),
      disabled: false,
      config: { type: '' },
    };
    const { getByTestId } = render(<UsergroupException {...props} />);
    const div = getByTestId('usergroup-whitelist');
    expect(div.innerHTML).toContain('test_usergroup');
  });

  it('re-enables exclude when include value is cleared', () => {
    const e: Exception = {
      include: ['test_usergroup'],
      exclude: [],
      whitelist: {},
    };
    props.element = {
      value: JSON.stringify(e),
      disabled: false,
      config: { type: '' },
    };
    const { queryByText, getByTestId } = render(
      <UsergroupException {...props} />
    );
    expect(getByTestId('usergroup-whitelist').innerHTML).toContain(
      'test_usergroup'
    );
    const xBox = queryByText('Test Usergroup')?.nextSibling;
    if (xBox) {
      fireEvent.click(xBox);
    }
    expect(queryByText('Test Usergroup')).toBeNull();
    expect(getByTestId('usergroup-whitelist').innerHTML).toContain(
      'All (No Exceptions)'
    );
  });

  it('re-enables include when exclude value is cleared', async () => {
    const e: Exception = {
      include: [],
      exclude: ['test_usergroup'],
      whitelist: {},
    };
    props.element = {
      value: JSON.stringify(e),
      disabled: false,
      config: { type: '' },
    };
    const { queryByText, getByTestId } = render(
      <UsergroupException {...props} />
    );
    expect(queryByText('Test Usergroup')).toBeTruthy();
    const xBox = queryByText('Test Usergroup')?.nextSibling;
    if (xBox) {
      fireEvent.click(xBox);
    }
    expect(queryByText('Test Usergroup')).toBeNull();
    expect(getByTestId('usergroup-whitelist').innerHTML).toContain(
      'All (No Exceptions)'
    );
  });

  it('creates none message', () => {
    const e: Exception = {
      include: [],
      exclude: usergroups.map((u) => u.id),
      whitelist: {},
    };
    props.element = {
      value: JSON.stringify(e),
      disabled: false,
      config: { type: '' },
    };
    const { getByText } = render(<UsergroupException {...props} />);
    expect(getByText('None (All Excluded)')).toBeInTheDocument();
  });

  it('creates all message by default', () => {
    const { getByText } = render(<UsergroupException {...props} />);
    expect(getByText('All (No Exceptions)')).toBeInTheDocument();
  });
});
