import {
  FC,
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import Select, { MultiValue } from 'react-select';
import { Usergroup } from '@arthrex/models/usergroup';
import { Option, Element, Exception } from '../../models';
import { convertValuesToOptions } from '../../util/conversions';

export type UsergroupSelectProps = {
  element: Element;
  values: Usergroup[];
  include: MultiValue<Option>;
  exclude: MultiValue<Option>;
  setInclude: Dispatch<SetStateAction<MultiValue<Option>>>;
  setExclude: Dispatch<SetStateAction<MultiValue<Option>>>;
};

/**
 * UsergroupSelect is a component used to display an include/exclude
 * list for content editors to modify.
 * @param element - Kontent.ai current @see Element
 * @param values - Values received from the acom-api, which are used to construct the default @see Option[]
 * and default inclusion/exclusion list.
 * @param include - @see Option[] state options to include
 * @param exclude - @see Option[] state options to exclude
 * @param setInclude - useState setter function to set the inclusion options
 * @param setExclude - useState setter function to set the exclusion options
 */
export const UsergroupSelect: FC<UsergroupSelectProps> = ({
  element,
  values,
  include,
  exclude,
  setInclude,
  setExclude,
}) => {
  const [availableOptions, setAvailableOptions] = useState<Option[]>([]);
  const [includeDisabled, setIncludeDisabled] = useState(false);
  const [excludeDisabled, setExcludeDisabled] = useState(false);

  /**
   * useEffect takes the initial element value and constructs the initial available
   * options, while populating the default values on the react-select element.
   */
  useEffect(() => {
    const currentValue: Exception = element.value
      ? JSON.parse(element.value)
      : null;
    const opt = convertValuesToOptions(values);

    // Based on the results returned from the API, and the current Element value,
    // we want to set the inclusion/exclusion list default values.
    if (currentValue) {
      if (currentValue.include.length > 0) {
        setExcludeDisabled(true);
        setInclude(opt.filter((o) => currentValue.include.includes(o.value)));
      } else if (currentValue.exclude.length > 0) {
        setIncludeDisabled(true);
        setExclude(opt.filter((o) => currentValue.exclude.includes(o.value)));
      }
    }
    setAvailableOptions(opt);
  }, [element.value, setExclude, setInclude, values]);

  /**
   * handleIncludeChange takes "value" which is an array of objects containing all the currently
   * selected options in the include select element. If there are values, we want to set the opposite
   * select element 'disabled' property, since these values are mutually exclusive (from a UX perpsective).
   * @param values - An array of all currently selected options in the include react-select input.
   */
  const handleIncludeChange = (values: MultiValue<Option>) => {
    setExcludeDisabled(values && values.length > 0);
    setInclude(values);
  };

  /**
   * @see handleExcludeChange
   * @param values - An array of all currently selected options in the exclude react-select input.
   */
  const handleExcludeChange = (values: MultiValue<Option>) => {
    setIncludeDisabled(values && values.length > 0);
    setExclude(values);
  };

  return (
    <Fragment>
      <div className="p-3">
        <h4>Include:</h4>
        <Select
          inputId="ugInclude"
          isDisabled={element.disabled || includeDisabled}
          isOptionDisabled={() =>
            availableOptions.length - (include.length + exclude.length) <= 1
          }
          options={availableOptions}
          value={include}
          isMulti
          onChange={handleIncludeChange}
        />
      </div>
      <div className="p-3">
        <h4>Exclude:</h4>
        <Select
          inputId="ugExclude"
          isDisabled={element.disabled || excludeDisabled}
          isOptionDisabled={() =>
            availableOptions.length - (include.length + exclude.length) <= 1
          }
          options={availableOptions}
          value={exclude}
          isMulti
          onChange={handleExcludeChange}
        />
      </div>
    </Fragment>
  );
};

export default UsergroupSelect;
