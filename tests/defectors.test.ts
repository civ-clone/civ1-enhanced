import { DEFECTORS_STAY_VETERAN, ENHANCED } from '../RuleSets';
import { Fortified, Veteran } from '@civ-clone/civ1-unit/UnitImprovements';
import loadGame, { Package, buildWorld, pluginOrder } from './lib/loadGame';
import { Bomber } from '@civ-clone/civ1-unit/Units';
import { KEEP_VETERAN_RULE } from '../RuleIds';
import Player from '@civ-clone/core-player/Player';
import StrategyNote from '@civ-clone/core-strategy/StrategyNote';
import { START_AFRESH_RULE as CIV1_START_AFRESH } from '@civ-clone/civ1-unit/RuleIds';
import Transferred from '@civ-clone/core-unit/Rules/Transferred';
import { expect } from 'chai';
import { turnsAloftKey } from '@civ-clone/civ1-unit/Rules/Player/turnEnd';

// A veteran, fortified Bomber a turn out, with its moves, that changes sides, in a game with civ1-unit's rules and this
//  package's, loaded in `order`, with `set` switched as given (left as it starts unless told).
const setUp = async (
  set: [string, boolean] | null = null,
  order: Package[] = pluginOrder
) => {
  const game = loadGame(['civ1-unit'], order),
    world = await buildWorld(game),
    from = new Player(game.rules),
    to = new Player(game.rules),
    unit = new Bomber(null, from, world.get(2, 2), game.rules),
    transferred: unknown[] = [];

  if (set !== null) {
    game.ruleSets.set(...set);
  }

  game.unitImprovements.register(new Veteran(unit), new Fortified(unit));
  game.strategyNotes.replace(new StrategyNote(turnsAloftKey(unit), 1));
  unit.moves().set(3);

  game.engine.on('unit:transferred', (): void => {
    transferred.push([
      unit.moves().value(),
      game.unitImprovements
        .getByUnit(unit)
        .map((improvement) => improvement.constructor),
    ]);
  });

  return {
    game,
    to,
    transferred,
    unit,
    improvements: () =>
      game.unitImprovements
        .getByUnit(unit)
        .map((improvement) => improvement.constructor),
    // The rules a change of sides runs, in the order it runs them.
    order: (): string[] =>
      game.rules
        .get(Transferred)
        .filter((rule) => rule.enabled())
        .map((rule) => rule.id()!),
  };
};

// What holds whichever rule is in force: the unit arrives as a new unit would, but for its veteran status.
const arrivesAfresh = (set: [string, boolean] | null): void => {
  it('should leave the unit unfortified, with no moves and its fuel full, before a client is told', async (): Promise<void> => {
    const { game, improvements, to, transferred, unit } = await setUp(set);

    unit.transfer(to);

    expect(unit.player()).to.equal(to);
    expect(improvements()).not.to.include(Fortified);
    expect(unit.moves().value()).to.equal(0);
    expect(game.strategyNotes.getByKey(turnsAloftKey(unit))).not.to.be.ok;
    expect(transferred).to.eql([[0, improvements()]]);
  });
};

describe('defectors stay veteran (civ-clone/web-renderer#960)', (): void => {
  (
    [
      ['by default', null],
      ['with the parent switched off', [ENHANCED, false]],
    ] as [string, [string, boolean] | null][]
  ).forEach(([name, set]): void => {
    describe(`a unit that changes sides starts afresh, as v474.05, ${name}`, (): void => {
      it('should be off', async (): Promise<void> => {
        const { game } = await setUp(set);

        expect(game.ruleSets.state(DEFECTORS_STAY_VETERAN)).to.equal('off');
      });

      arrivesAfresh(set);

      it('should no longer be a veteran', async (): Promise<void> => {
        const { improvements, to, unit } = await setUp(set);

        unit.transfer(to);

        expect(improvements()).to.eql([]);
      });
    });
  });

  describe('a unit that changes sides keeps its veteran status, switched on', (): void => {
    const on: [string, boolean] = [DEFECTORS_STAY_VETERAN, true];

    arrivesAfresh(on);

    it('should still be a veteran', async (): Promise<void> => {
      const { improvements, to, unit } = await setUp(on);

      unit.transfer(to);

      expect(improvements()).to.eql([Veteran]);
    });

    it('should start the unit afresh where the Civ1 rule does, before the client is told, whichever package loads first', async (): Promise<void> => {
      const expected = [KEEP_VETERAN_RULE, 'civ1-unit:unit/transferred/emit'];

      expect((await setUp(on)).order()).to.eql(expected);
      expect(
        (
          await setUp(on, [
            ...pluginOrder.filter((name) => name !== 'civ1-enhanced'),
            'civ1-enhanced',
          ])
        ).order()
      ).to.eql(expected);
      expect((await setUp()).order()).to.eql([
        CIV1_START_AFRESH,
        'civ1-unit:unit/transferred/emit',
      ]);
    });
  });
});
