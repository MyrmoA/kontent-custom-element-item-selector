import {
  FC,
  Dispatch,
  SetStateAction,
  Fragment,
  useEffect,
  useState,
} from 'react';
import Select, { MultiValue } from 'react-select';
import { Country } from '@arthrex/models/country';
import { WorldRegion } from '@arthrex/models/world-region';
import { Option, Element, Exception } from '../../models';
import { convertValuesToOptions } from '../../util/conversions';

export type GeographicSelectProps = {
  element: Element;
  values: WorldRegion[] | Country[];
  include: MultiValue<Option>;
  exclude: MultiValue<Option>;
  setInclude: Dispatch<SetStateAction<MultiValue<Option>>>;
  setExclude: Dispatch<SetStateAction<MultiValue<Option>>>;
};

/**
 * GeographicSelect is an umbrella component used to display an include/exclude
 * list for content editors to modify.
 * @param element - Kontent.ai current @see Element
 * @param values - Values received from the acom-api, which are used to construct the default @see Option[]
 * and default inclusion/exclusion list.
 * @param include - @see Option[] state options to include
 * @param exclude - @see Option[] state options to exclude
 * @param setInclude - useState setter function to set the inclusion options
 * @param setExclude - useState setter function to set the exclusion options
 */
export const GeographicSelect: FC<GeographicSelectProps> = ({
  element,
  values,
  include,
  exclude,
  setInclude,
  setExclude,
}) => {
  const [availableOptions, setAvailableOptions] = useState<Option[]>([]);
  const [allOptions, setAllOptions] = useState<Option[]>([]);

  /**
   * useEffect takes the initial element value and constructs the initial available
   * options, while populating the default values on the react-select element.
   * It's necessary to maintain two lists in case the user adds or removes values; we have the
   * total set of options (allOptions), and we have the currently available options (options).
   */
  useEffect(() => {
    const currentValue: Exception = element.value
      ? JSON.parse(element.value)
      : null;
    const opt = convertValuesToOptions(values);
    setAllOptions(opt);

    // Based on the results returned from the API, and the current Element value,
    // we want to set the inclusion/exclusion list default values.
    let initialInclude: Option[] = [];
    let initialExclude: Option[] = [];
    if (currentValue) {
      initialInclude = opt.filter((o) =>
        currentValue.include.includes(o.value)
      );
      initialExclude = opt.filter((o) =>
        currentValue.exclude.includes(o.value)
      );
      setInclude(initialInclude);
      setExclude(initialExclude);
    }
    setAvailableOptions(
      opt.filter(
        (o) => !initialInclude.includes(o) && !initialExclude.includes(o)
      )
    );
  }, [element.value, setExclude, setInclude, values]);

  /**
   * handleIncludeChange takes "value" which is an array of objects containing all the currently
   * selected options in the include select element. All selected options are removed from the
   * selectable options of both the include and exclude selects. In the case of nothing being included,
   * options are set back to everything that isn't currently selected as "excluded"
   * @param values - An array of all currently selected options in the include react-select input.
   */
  const handleIncludeChange = (values: MultiValue<Option>) => {
    const selectedValues = values || [];
    setAvailableOptions(
      allOptions.filter(
        (option) =>
          !selectedValues.includes(option) && !exclude?.includes(option)
      )
    );
    setInclude(values);
  };

  /**
   * @see handleIncludeChange but with the opposite filtering to update the include list in this instance.
   * @param values - An array of all currently selected options in the exclude react-select input.
   */
  const handleExcludeChange = (values: MultiValue<Option>) => {
    const selectedValues = values || [];
    setAvailableOptions(
      allOptions.filter(
        (option) =>
          !selectedValues.includes(option) && !include?.includes(option)
      )
    );
    setExclude(values);
  };

  return (
    <Fragment>
      <div className="p-3" data-testid="include">
        <h4>Include:</h4>
        <Select
          isDisabled={element.disabled}
          options={availableOptions}
          value={include}
          isMulti
          onChange={handleIncludeChange}
        />
      </div>

      <div className="p-3" data-testid="exclude">
        <h4>Exclude:</h4>
        <Select
          isDisabled={element.disabled}
          options={availableOptions}
          value={exclude}
          isMulti
          onChange={handleExcludeChange}
        />
      </div>
    </Fragment>
  );
};

export default GeographicSelect;
