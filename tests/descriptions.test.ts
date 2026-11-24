import {
  MassTransit,
  SdiDefence,
} from '@civ-clone/library-city/CityImprovements';
import {
  Automobile,
  Industrialization,
  MassProduction,
  Plastics,
} from '@civ-clone/civ1-science/Advances';
import { Pollution, Railroad } from '@civ-clone/civ1-world/TileImprovements';
import detonated from '../Rules/Unit/detonated';
import railroadsInCities from '../Rules/Unit/railroadsInCities';
import { expect } from 'chai';
import pacified from '../Rules/Player/pacified';
import processYield from '../Rules/City/processYield';
import { UnitedNations } from '@civ-clone/civ1-wonder/Wonders';

// What the rules that take Civ1's place say they do, for the Civilopedia (civ-clone/web-renderer#1196): the same as
//  Civ1's for pollution and a railroad's movement (civ-clone/web-renderer#1272), and SDI Defense sparing the city's
//  size as well.
describe('descriptions', (): void => {
  it('pollution in every city says Mass Transit stops the population polluting, and what causes Pollution', (): void => {
    expect(
      processYield({} as any).flatMap((rule) => rule.descriptions())
    ).to.eql([
      {
        type: 'pollution_source_removed',
        subject: MassTransit,
        source: 'population',
      },
      {
        type: 'caused_by',
        subject: Pollution,
        source: 'production',
      },
      {
        type: 'caused_by',
        subject: Pollution,
        source: 'population',
        with: [Industrialization, Automobile, MassProduction, Plastics],
      },
    ]);
  });

  it('a railroad on both squares says land units move along it for free', (): void => {
    expect(
      railroadsInCities({} as any).flatMap((rule) => rule.descriptions())
    ).to.eql([{ type: 'route_free', subject: Railroad }]);
  });

  it('SDI Defense sparing cities says the city loses no people', (): void => {
    expect(detonated({} as any).flatMap((rule) => rule.descriptions())).to.eql([
      {
        type: 'protects_from',
        subject: SdiDefence,
        event: 'nuclear_attack',
        what: 'size',
      },
    ]);
  });

  it("the United Nations stopping computer wars says other leaders offer peace, as Civ1's does", (): void => {
    expect(pacified({} as any).flatMap((rule) => rule.descriptions())).to.eql([
      { type: 'pacifies', subject: UnitedNations },
    ]);
  });
});
