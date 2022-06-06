import { FC, useEffect, useState } from 'react';
import { MultiValue } from 'react-select';
import { usergroups } from '@arthrex/models/usergroup';
import { Option, Whitelist, CustomElementProps } from '../../models';
import UsergroupSelect from './usergroup-select';
import { constructUsergroupException } from '../../util/conversions';
import logger from '@arthrex/util/logger';

export type UsergroupExceptionProps = CustomElementProps;

/**
 * UsergroupException wraps the UsergroupSelect component.
 * It handles the logic for loading the usergroups, as well as calculating and setting the
 * whitelist values on user input.
 * @param element - Kontent.ai @see Element This contains the enabled/disabled state as well as the previous value for setting initial state
 * @param api - Kontent.ai API Custom Element exposed through their Javascript load. For development, we don't use this. But for everything
 * else it is used to update the value using the api.setValue function.
 */
export const UsergroupException: FC<UsergroupExceptionProps> = ({
  element,
  api,
}) => {
  const [whitelist, setWhitelist] = useState<Whitelist>(Object.create(null));
  const [includeUsergroups, setIncludeUsergroups] = useState<
    MultiValue<Option>
  >([]);
  const [excludeUsergroups, setExcludeUsergroups] = useState<
    MultiValue<Option>
  >([]);

  /**
   * useEffect in this case is only called on state updates for any of the above lists.
   * This useEffect will use the values of the lists above and construct an overarching
   * whitelist value. Afterwards, it will set the value of the Kontent element with a
   * KontentValue object containing the current list values, and the whitelist.
   */
  useEffect(() => {
    // Map out the included/excluded individual usergroups by id.
    const exception = constructUsergroupException(
      includeUsergroups,
      excludeUsergroups,
      usergroups
    );

    // QED
    setWhitelist(exception.whitelist);

    if (process.env.NX_DEBUG === 'true' || !api) {
      logger.info(`Updating Exception Element: ${JSON.stringify(exception)}`);
    } else {
      api.setValue(JSON.stringify(exception));
    }
  }, [api, excludeUsergroups, includeUsergroups]);

  /**
   * createMessage returns a message indicating:
   * - all options have been excluded
   * - all options have been whitelisted (none included/excluded)
   * - some exceptions have been specified. In this case, the list of those exceptions will be returned.
   *
   * @return {*}  {string}
   */
  const createMessage = (): string => {
    if (Object.keys(whitelist).length === 0) {
      if (excludeUsergroups.length > 0) {
        return 'None (All Excluded)';
      }
      return 'All (No Exceptions)';
    }

    return new Array(Object.keys(whitelist)).join(', ');
  };

  return (
    <div className="p-3">
      <h2>Usergroups:</h2>
      <UsergroupSelect
        element={element}
        values={usergroups}
        include={includeUsergroups}
        exclude={excludeUsergroups}
        setInclude={setIncludeUsergroups}
        setExclude={setExcludeUsergroups}
      />
      <hr />
      <h2>Whitelist:</h2>
      <div className="p-3" data-testid="usergroup-whitelist">
        {createMessage()}
      </div>
    </div>
  );
};
