import {
  MassTransit,
  SdiDefence,
} from '@civ-clone/library-city/CityImprovements';
import detonated from '../Rules/Unit/detonated';
import { expect } from 'chai';
import pacified from '../Rules/Player/pacified';
import processYield from '../Rules/City/processYield';
import { UnitedNations } from '@civ-clone/civ1-wonder/Wonders';

// What the rules that take Civ1's place say they do, for the Civilopedia (civ-clone/web-renderer#1196): the same as
//  Civ1's for pollution, and SDI Defense sparing the city's size as well.
describe('descriptions', (): void => {
  it('pollution in every city says Mass Transit stops the population polluting', (): void => {
    expect(
      processYield({} as any).flatMap((rule) => rule.descriptions())
    ).to.eql([
      {
        type: 'pollution_source_removed',
        subject: MassTransit,
        source: 'population',
      },
    ]);
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
