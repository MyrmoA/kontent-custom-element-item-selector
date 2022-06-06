import { MultiValue } from 'react-select';
import { WorldRegion } from '@arthrex/models/world-region';
import { Usergroup } from '@arthrex/models/usergroup';
import { Country } from '@arthrex/models/country';
import { Option, Exception, Whitelist } from '../models';

/**
 * convertValuesToOptions is responsible for taking a World Region or Country and converting it
 * to an Option that can be displayed in the react-select Select element.
 * @param values - the @see WorldRegion[] or @see Country[] we will be converting to @see Option[]
 */
const convertValuesToOptions = (
  values: WorldRegion[] | Country[] | Usergroup[]
): Option[] => {
  const options: Option[] = [];
  for (let i = 0; i < values.length; i++) {
    options.push({ value: values[i].id, label: values[i].name });
  }
  return options;
};

/**
 * constructGeographicException takes all the values specified in the select boxes for
 * world regions and countries, and constructs an @see Exception object including the
 * combined whitelisted values. This whitelist will be used to compare against a user's country
 * to determine if a Kontent item should be shown to them.
 * @param includeWorldRegions - Included world regions
 * @param excludeWorldRegions - Excluded world regions
 * @param includeCountries - Included countries
 * @param excludeCountries - Excluded countries
 * @param countries - The complete list of @see Country objects from Kontent.
 * @param worldregions - The complete list of @see WorldRegion objects from Kontent.
 */
const constructGeographicException = (
  includeWorldRegions: MultiValue<Option>,
  excludeWorldRegions: MultiValue<Option>,
  includeCountries: MultiValue<Option>,
  excludeCountries: MultiValue<Option>,
  countries: Country[],
  worldregions: WorldRegion[]
): Exception => {
  const whitelistMap: Whitelist = Object.create(null);
  let oppositeCountries = false;
  let oppositeWorldregions = false;

  // Get the whitelisted and blacklisted countries from the
  // world regions, based on what the user has set the ids to.
  let wrIncludedids = (includeWorldRegions || []).map((r) => r.value);
  const wrExcludedids = (excludeWorldRegions || []).map((r) => r.value);

  // Map out the included/excluded individual countries by id.
  let cIncludedids = (includeCountries || []).map((c) => c.value);
  const cExcludedids = (excludeCountries || []).map((c) => c.value);

  // If only a country exclusion list is provided, then get the opposite
  // values as the inclusion list.
  if (
    cIncludedids.length === 0 &&
    cExcludedids.length > 0 &&
    wrIncludedids.length === 0 &&
    wrExcludedids.length === 0
  ) {
    oppositeCountries = true;
    cIncludedids = countries
      .map((c) => c.id)
      .filter((cid) => !cExcludedids.includes(cid));
  }

  // Similarly, if only a world region exclusion list is provided, then get the opposite
  // values as the inclusion list. (Note that country exceptions will take precedence,
  // so we don't need to check if those are empty)
  if (wrIncludedids.length === 0 && wrExcludedids.length > 0) {
    oppositeWorldregions = true;
    wrIncludedids = worldregions
      .map((wr) => wr.id)
      .filter((wrid) => !wrExcludedids.includes(wrid));
  }

  // extract the list of countries from the world regions
  // that were included/excluded.
  const wrIncludedCountries = worldregions
    .filter((r) => wrIncludedids.includes(r.id)) // First, filter only those world regions the user has included
    .map((r) => r.countries) // Next, pull out only those world region's countries.
    .reduce((acc, c) => acc.concat(c), []) // Then, join all of the country arrays together
    .map((c) => c.id); // Finally, extract only those countries ids.

  const wrExcludedCountries = worldregions
    .filter((r) => wrExcludedids.includes(r.id))
    .map((r) => r.countries)
    .reduce((acc, c) => acc.concat(c), [])
    .map((c) => c.id);

  // Create a world region whitelist
  let whitelist = wrIncludedCountries.filter(
    (v) => !wrExcludedCountries.includes(v)
  );

  // Override the world region whitelist values with explicit country exclusions
  whitelist = whitelist.filter((c) => !cExcludedids.includes(c));

  // Then add back the explicity country inclusions (deduped in a Set)
  whitelist = whitelist.concat(cIncludedids);

  // Deduplicate values
  whitelist = Array.from(new Set(whitelist));

  // Convert to object QED
  whitelist.forEach((id) => (whitelistMap[id] = true));

  const exception: Exception = {
    include: (oppositeCountries ? [] : cIncludedids).concat(
      oppositeWorldregions ? [] : wrIncludedids
    ),
    exclude: cExcludedids.concat(wrExcludedids),
    whitelist: whitelistMap,
  };
  return exception;
};

/**
 * constructUsergroupException takes the included and excluded usergroups specified
 * in the select, and creates an @see Exception object, including a whitelist of the
 * allowed usergroups. This whitelist will be used by arthrex.com to determine if an
 * item should be shown to a user.
 * @param includeUsergroups - Included usergroups
 * @param excludeUsergroups - Excluded usergroup
 * @param usergroups - The complete list of @see Usergroup objects from Kontent
 */
const constructUsergroupException = (
  includeUsergroups: MultiValue<Option>,
  excludeUsergroups: MultiValue<Option>,
  usergroups: Usergroup[]
): Exception => {
  const cIncludedids = (includeUsergroups || []).map((c) => c.value);
  const cExcludedids = (excludeUsergroups || []).map((c) => c.value);

  const whitelist: Whitelist = Object.create(null);
  // If only a country exclusion list is provided, then get the opposite
  // values as the inclusion list.
  if (cIncludedids.length === 0 && cExcludedids.length > 0) {
    usergroups
      .map((c) => c.id)
      .filter((cid) => !cExcludedids.includes(cid))
      .forEach((id) => (whitelist[id] = true));
  } else {
    // Otherwise, just use the inclusion list.
    cIncludedids.forEach((id) => (whitelist[id] = true));
  }

  const exception: Exception = {
    include: cIncludedids,
    exclude: cExcludedids,
    whitelist: whitelist,
  };
  return exception;
};

export {
  convertValuesToOptions,
  constructGeographicException,
  constructUsergroupException,
};
