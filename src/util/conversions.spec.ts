import { WorldRegion, WorldRegionCode } from '@arthrex/models/world-region';
import { Usergroup } from '@arthrex/models/usergroup';
import { Country } from '@arthrex/models/country';

import {
  constructGeographicException,
  constructUsergroupException,
  convertValuesToOptions,
} from './conversions';

const mockUS: Country = {
  id: 'us',
  name: 'united states',
  geo_data: '',
  restrictions: [],
};

const mockCA: Country = {
  id: 'ca',
  name: 'canada',
  geo_data: '',
  restrictions: [],
};

const mockDE: Country = {
  id: 'de',
  name: 'germany',
  geo_data: '',
  restrictions: [],
};

const mockWHP: WorldRegion = {
  id: WorldRegionCode.WHP,
  name: 'western hemisphere',
  countries: [mockUS, mockCA],
};

const mockEMA: WorldRegion = {
  id: WorldRegionCode.EHP,
  name: 'emea',
  countries: [mockDE],
};

const mockUsergroup: Usergroup = {
  id: 'test_usergroup',
  name: 'test usergroup',
};

const mockUsergroup2: Usergroup = {
  id: 'test_usergroup2',
  name: 'test usergroup2',
};

const mockWorldRegions = [mockWHP, mockEMA];
const mockCountries = [mockUS, mockDE, mockCA];
const mockUsergroups = [mockUsergroup, mockUsergroup2];

describe('Conversions', () => {
  it('converts usergroups', () => {
    const e = convertValuesToOptions([mockUsergroup]);
    expect(e.length).toBe(1);
    expect(e[0].label).toEqual('test usergroup');
    expect(e[0].value).toEqual('test_usergroup');
  });

  it('converts countries', () => {
    const e = convertValuesToOptions([mockCA]);
    expect(e.length).toBe(1);
    expect(e[0].label).toEqual('canada');
    expect(e[0].value).toEqual('ca');
  });

  it('converts worldregions', () => {
    const e = convertValuesToOptions([mockWHP]);
    expect(e.length).toBe(1);
    expect(e[0].label).toEqual('western hemisphere');
    expect(e[0].value).toEqual(WorldRegionCode.WHP);
  });
});

describe('Geographic Exception Whitelist', () => {
  it('includes only a single world region', () => {
    const e = constructGeographicException(
      [{ value: WorldRegionCode.WHP, label: 'western hemisphere' }],
      [],
      [],
      [],
      mockCountries,
      mockWorldRegions
    );
    expect(e.whitelist.us).toBeTruthy();
    expect(e.whitelist.ca).toBeTruthy();
    expect(e.whitelist.de).toBeFalsy();
  });

  it('includes only a single country', () => {
    const e = constructGeographicException(
      [],
      [],
      [{ value: 'de', label: 'germany' }],
      [],
      mockCountries,
      mockWorldRegions
    );
    expect(e.whitelist.de).toBeTruthy();
    expect(e.whitelist.us).toBeFalsy();
    expect(e.whitelist.ca).toBeFalsy();
  });

  it('excludes a single country, generating an opposite country list', () => {
    const e = constructGeographicException(
      [],
      [],
      [],
      [{ value: 'de', label: 'germany' }],
      mockCountries,
      mockWorldRegions
    );
    expect(e.whitelist.us).toBeTruthy();
    expect(e.whitelist.ca).toBeTruthy();
    expect(e.whitelist.de).toBeFalsy();
  });

  it('exclude a single world region, generating an opposite country list', () => {
    const e = constructGeographicException(
      [],
      [{ value: WorldRegionCode.WHP, label: 'whp' }],
      [],
      [],
      mockCountries,
      mockWorldRegions
    );
    expect(e.whitelist.us).toBeFalsy();
    expect(e.whitelist.ca).toBeFalsy();
    expect(e.whitelist.de).toBeTruthy();
  });

  // By excluding a world region, we are including the other world regions
  // and then overriding the excluded value with an implicity country inclusion.
  it('include country overrides - same geography', () => {
    const e = constructGeographicException(
      [],
      [{ value: WorldRegionCode.WHP, label: 'whp' }],
      [{ value: 'ca', label: 'ca' }],
      [],
      mockCountries,
      mockWorldRegions
    );
    expect(e.whitelist.de).toBeTruthy();
    expect(e.whitelist.us).toBeFalsy();
    expect(e.whitelist.ca).toBeTruthy();
  });

  it('exclude country overrides - same geography', () => {
    const e = constructGeographicException(
      [{ value: WorldRegionCode.EHP, label: 'emea' }],
      [],
      [],
      [{ value: 'de', label: 'germany' }],
      mockCountries,
      mockWorldRegions
    );
    expect(e.whitelist.de).toBeFalsy();
    expect(e.whitelist.us).toBeFalsy();
  });

  it('include country overrides - opposite geography', () => {
    const e = constructGeographicException(
      [],
      [{ value: WorldRegionCode.WHP, label: 'whp' }],
      [{ value: 'de', label: 'germany' }],
      [],
      mockCountries,
      mockWorldRegions
    );
    expect(e.whitelist.de).toBeTruthy();
    expect(e.whitelist.us).toBeFalsy();
    expect(e.whitelist.ca).toBeFalsy();
  });

  it('exclude country overrides - opposite geography', () => {
    const e = constructGeographicException(
      [{ value: WorldRegionCode.EHP, label: 'emea' }],
      [],
      [],
      [{ value: 'us', label: 'united states' }],
      mockCountries,
      mockWorldRegions
    );
    expect(e.whitelist.de).toBeTruthy();
    expect(e.whitelist.us).toBeFalsy();
    expect(e.whitelist.ca).toBeFalsy();
  });

  it('combine includes - opposite geography', () => {
    const e = constructGeographicException(
      [{ value: WorldRegionCode.EHP, label: 'emea' }],
      [],
      [{ value: 'us', label: 'united states' }],
      [],
      mockCountries,
      mockWorldRegions
    );
    expect(e.whitelist.de).toBeTruthy();
    expect(e.whitelist.us).toBeTruthy();
    expect(e.whitelist.ca).toBeFalsy();
  });

  it('combine excludes - opposite geography', () => {
    const e = constructGeographicException(
      [],
      [{ value: WorldRegionCode.EHP, label: 'emea' }],
      [],
      [{ value: 'us', label: 'united states' }],
      mockCountries,
      mockWorldRegions
    );
    expect(e.whitelist.de).toBeFalsy();
    expect(e.whitelist.us).toBeFalsy();
    expect(e.whitelist.ca).toBeTruthy();
  });

  it('combine excludes - same geography', () => {
    const e = constructGeographicException(
      [],
      [{ value: WorldRegionCode.WHP, label: 'whp' }],
      [],
      [{ value: 'us', label: 'united states' }],
      mockCountries,
      mockWorldRegions
    );
    expect(e.whitelist.de).toBeTruthy();
    expect(e.whitelist.us).toBeFalsy();
    expect(e.whitelist.ca).toBeFalsy();
  });

  it('combine includes - same geography', () => {
    const e = constructGeographicException(
      [],
      [{ value: WorldRegionCode.WHP, label: 'whp' }],
      [],
      [{ value: 'us', label: 'united states' }],
      mockCountries,
      mockWorldRegions
    );
    expect(e.whitelist.de).toBeTruthy();
    expect(e.whitelist.us).toBeFalsy();
    expect(e.whitelist.ca).toBeFalsy();
  });
});

describe('Usergroup Exception Whitelist', () => {
  it('includes a single usergroup', () => {
    const e = constructUsergroupException(
      [{ value: 'test_usergroup', label: 'test' }],
      [],
      mockUsergroups
    );
    expect(e.whitelist.test_usergroup).toBeTruthy();
  });

  it('excludes a single usergroup', () => {
    const e = constructUsergroupException(
      [],
      [{ value: 'test_usergroup2', label: 'test' }],
      mockUsergroups
    );
    expect(e.whitelist.test_usergroup).toBeTruthy();
  });
});
