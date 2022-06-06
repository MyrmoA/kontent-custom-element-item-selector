import { FC, useEffect, useState } from 'react';
import { MultiValue } from 'react-select';
import GeographicSelect from './geographic-select';
import { Option, Whitelist, CustomElementProps } from '../../models';
import { worldRegions } from '@arthrex/models/world-region';
import { constructGeographicException } from '../../util/conversions';
import { countries as staticCountries } from '@arthrex/models/country';
import { Language } from '@arthrex/models/language';
import logger from '@arthrex/util/logger';

export type GeographicExceptionProps = CustomElementProps;

/**
 * GeographicException wraps the KontentException components related to
 * World Regions and Countries. It handles the logic for loading the world regions
 * and countries, as well as calculating and setting the whitelist values on
 * user input.
 * @param element - Kontent.ai @see Element This contains the enabled/disabled state as well as the previous value for setting initial state
 * @param api - Kontent.ai API Custom Element exposed through their Javascript load. For development, we don't use this. But for everything
 * else it is used to update the value using the api.setValue function.
 */
export const GeographicException: FC<GeographicExceptionProps> = ({
  element,
  api,
}) => {
  const [whitelist, setWhitelist] = useState<Whitelist>(Object.create(null));
  const countries = staticCountries[Language.en];
  const [includeCountries, setIncludeCountries] = useState<MultiValue<Option>>(
    []
  );
  const [excludeCountries, setExcludeCountries] = useState<MultiValue<Option>>(
    []
  );
  const [includeWorldRegions, setIncludeWorldRegions] = useState<
    MultiValue<Option>
  >([]);
  const [excludeWorldRegions, setExcludeWorldRegions] = useState<
    MultiValue<Option>
  >([]);

  /**
   * useEffect in this case is only called on state updates for any of the above lists.
   * This useEffect will use the values of the lists above and construct an overarching
   * whitelist value. Afterwards, it will set the value of the Kontent element with a
   * KontentValue object containing the current list values, and the whitelist.
   */
  useEffect(() => {
    const exception = constructGeographicException(
      includeWorldRegions,
      excludeWorldRegions,
      includeCountries,
      excludeCountries,
      countries,
      worldRegions
    );

    // QED
    setWhitelist(exception.whitelist);

    if (process.env.NX_DEBUG === 'true' || !api) {
      logger.info(`Updating Exception Element: ${JSON.stringify(exception)}`);
    } else {
      api.setValue(JSON.stringify(exception));
    }
  }, [
    includeCountries,
    includeWorldRegions,
    excludeCountries,
    excludeWorldRegions,
    api,
    countries,
  ]);

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
      if (excludeCountries.length > 0 || excludeWorldRegions.length > 0) {
        return 'None (All Excluded)';
      }
      return 'All (No Exceptions)';
    }

    return new Array(Object.keys(whitelist)).join(', ');
  };

  return (
    <div className="p-3">
      <h2>Countries:</h2>
      <p>
        <strong>Note:</strong> Country exceptions take precedence over world
        region exceptions.
        <br />
        Example: if you include world region 'Western Hemisphere', but then
        exclude country 'United States', the country exception will override the
        world region inclusion.
      </p>
      <GeographicSelect
        element={element}
        values={countries}
        include={includeCountries}
        exclude={excludeCountries}
        setInclude={setIncludeCountries}
        setExclude={setExcludeCountries}
      />
      <hr />
      <h2>World Regions:</h2>
      <GeographicSelect
        element={element}
        values={worldRegions}
        include={includeWorldRegions}
        exclude={excludeWorldRegions}
        setInclude={setIncludeWorldRegions}
        setExclude={setExcludeWorldRegions}
      />
      <hr />
      <h2>Whitelist:</h2>
      <div className="p-3" data-testid="geographic-whitelist">
        {createMessage()}
      </div>
    </div>
  );
};
