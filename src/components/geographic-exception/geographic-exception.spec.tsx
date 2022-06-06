import { render } from '@testing-library/react';
import {
  GeographicException,
  GeographicExceptionProps,
} from './geographic-exception';
import { Element, Exception } from '../../models';

jest.mock('axios');

// It's important to note that you can only mock a module when
// it has default exports. If `GeographicSelect` was only a named
// export, this would fail
jest.mock('./geographic-select', () => {
  return () => {
    return 'Mock';
  };
});

const exception: Exception = { include: [], exclude: [], whitelist: {} };
const element: Element = {
  value: JSON.stringify(exception),
  disabled: false,
  config: { type: '' },
};
const props: GeographicExceptionProps = {
  element: element,
  api: undefined,
};

describe('Geographic Exception', () => {
  beforeEach(() => {
    props.element = element;
  });

  it('renders successfully', async () => {
    const { findByText } = render(<GeographicException {...props} />);
    expect(await findByText(/Countries:/i)).toBeTruthy();
  });
});
