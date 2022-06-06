import { Fragment } from 'react';
import * as ReactDOM from 'react-dom/client';
import { GeographicException, UsergroupException } from './components';
import { Element } from './models';
import logger from '@arthrex/util/logger';

/**
 * ElementType represents the different forms that the custom element can exist in.
 *
 * @export
 * @enum {number}
 */
export enum ElementType {
  Geographic = 'geographic',
  UserGroup = 'usergroup',
}

/**
 * initialization is responsible for determining whether we should render
 * a @see GeographicException or @see UsergroupException component based on what the
 * type is set to in the JSON of Kontent.
 * @param {Element} element - The current element object in Kontent.ai that contains the existing value.
 * @param {*} _context - The Kontent.ai context - not currently used
 */
const initialization = (element: Element, _context: any): any => {
  if (!element.config || !element.config.type) {
    logger.info("Custom Element missing JSON 'type'");
    return null;
  }

  if (!CustomElement) {
    logger.info('Failed to load custom element javascript.');
    return null;
  }

  let component = <Fragment></Fragment>;
  switch (element.config.type.toLocaleLowerCase()) {
    case ElementType.Geographic.toLocaleLowerCase():
      component = <GeographicException element={element} api={CustomElement} />;
      break;
    case ElementType.UserGroup.toLocaleLowerCase():
      component = <UsergroupException element={element} api={CustomElement} />;
      break;
    default:
      break;
  }

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(component);
};

// For development, we are going to render the exceptions outside
// of the CustomElement context with normal react in order to be able
// to view them without embedding them in an iFrame like Kontent requires.
if (process.env.NX_DEBUG === 'true') {
  const geoElement: Element = {
    disabled: false,
    value: JSON.stringify({
      include: ['US', 'WHP'],
      exclude: [],
      whitelist: [],
    }),
    config: { type: '' },
  };
  const usergroupElement: Element = {
    disabled: false,
    value: JSON.stringify({
      include: ['test_usergroup'],
      exclude: [],
      whitelist: [],
    }),
    config: { type: '' },
  };

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(
    <Fragment>
      <GeographicException element={geoElement} api={undefined} />
      <UsergroupException element={usergroupElement} api={undefined} />
    </Fragment>
  );
} else {
  // If we are not in development, we will initialize the CustomElement
  // javascript - this should only happen when built to production and referenced
  // via Kontent.
  CustomElement.init((element: Element, _context: any) => {
    // This switch statement may not work - height may need to be set after
    // initialization of the custom element
    switch (element.config.type.toLocaleLowerCase()) {
      default:
        CustomElement.setHeight(860);
        break;
    }
    initialization(element, _context);
  });
}
