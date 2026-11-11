import * as Civilizations from '@civ-clone/civ1-world-civilizations/Civilizations';
import Civilization from '@civ-clone/core-civilization/Civilization';
import { expect } from 'chai';
import { instance as civilizationRegistryInstance } from '@civ-clone/core-civilization/CivilizationRegistry';
// `index` registers against the default instances, as the plugin loader's import of this package does.
import '../index';

const additional = Object.values(Civilizations) as (typeof Civilization)[];

describe('civilizations', (): void => {
  it('should bring the 12 civilizations the original does not have', (): void => {
    expect(additional).to.have.lengthOf(12);

    additional.forEach((CivilizationType): void =>
      expect(
        civilizationRegistryInstance.includes(CivilizationType),
        CivilizationType.name
      ).to.equal(true)
    );
  });
});
