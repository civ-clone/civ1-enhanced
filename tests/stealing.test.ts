import {
  Alphabet,
  Currency,
  Writing,
} from '@civ-clone/library-science/Advances';
import { ENHANCED, EVEN_ADVANCE_STEALING } from '../RuleSets';
import loadGame, { buildWorld, scriptedRng } from './lib/loadGame';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import City from '@civ-clone/core-city/City';
import { Diplomat } from '@civ-clone/civ1-unit/Units';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import TechnologyStolen from '@civ-clone/base-unit-action-steal-technology/Rules/TechnologyStolen';
import { expect } from 'chai';

// A thief with a Diplomat next to a city of the victim's, each knowing what they're given, in a game with civ1-unit's
//  rules and this package's, with `set` switched as given (left as it starts unless told). The game's random number
//  generator returns `rolls`, in turn, then 0.
const setUp = async (
  thiefKnows: (typeof Advance)[],
  victimKnows: (typeof Advance)[],
  rolls: number[] = [],
  set: [string, boolean] | null = null
) => {
  const game = loadGame(['civ1-unit'], undefined, { rng: scriptedRng(rolls) }),
    world = await buildWorld(game),
    thief = new Player(game.rules),
    victim = new Player(game.rules),
    stolen: unknown[][] = [];

  if (set !== null) {
    game.ruleSets.set(...set);
  }

  (
    [
      [thief, thiefKnows],
      [victim, victimKnows],
    ] as [Player, (typeof Advance)[]][]
  ).forEach(([player, known]): void => {
    const research = new PlayerResearch(
      player,
      new AdvanceRegistry(),
      game.rules
    );

    known.forEach((AdvanceType) => research.addAdvance(AdvanceType));
    game.playerResearch.register(research);
  });

  const city = new City(victim, world.get(2, 2), 'Test', game.rules),
    diplomat = new Diplomat(null, thief, world.get(1, 2), game.rules);

  game.cities.register(city);
  game.engine.on('player:advance-stolen', (...args: unknown[]): void => {
    stolen.push(args);
  });

  return {
    game,
    rolls,
    stolen,
    thief,
    victim,
    // What the Diplomat steals, if anything, as `StealTechnology` asks the rules.
    steal: (): (typeof Advance)[] => {
      const results = game.rules.process(TechnologyStolen, diplomat, city);

      expect(results.filter((result) => result === true).length).to.be.at.most(
        1
      );

      return stolen.map(([, , AdvanceType]) => AdvanceType as typeof Advance);
    },
  };
};

// A roll that starts v474.05's walk at `index` of its 72 advances.
const at = (index: number): number => (index + 0.5) / 72;

describe('even advance stealing (civ-clone/web-renderer#960)', (): void => {
  describe('each advance as likely, by default', (): void => {
    it('should be on', (): void => {
      expect(
        loadGame(['civ1-unit']).ruleSets.state(EVEN_ADVANCE_STEALING)
      ).to.equal('on');
    });

    // civ1-unit's rule as it was (civ-clone/web-renderer#58): an index into what can be stolen, in the order the
    //  victim learnt it.
    it('should take what the roll picks of the advances the thief lacks, in the order the victim learnt them', async (): Promise<void> => {
      // Of [Writing, Currency, Alphabet], 0.4 × 3 picks the second.
      const { rolls, steal, thief, game } = await setUp(
        [],
        [Writing, Currency, Alphabet],
        [0.4, 0.9]
      );

      expect(steal()).to.eql([Currency]);
      expect(game.playerResearch.getByPlayer(thief).completed(Currency)).true;
      expect(rolls).to.eql([0.9]);
    });

    it('should pass over what the thief knows', async (): Promise<void> => {
      const { steal } = await setUp(
        [Currency],
        [Writing, Currency, Alphabet],
        [0.6]
      );

      // Of [Writing, Alphabet], 0.6 × 2 picks the second.
      expect(steal()).to.eql([Alphabet]);
    });

    it('should not draw with nothing to take', async (): Promise<void> => {
      const { rolls, steal } = await setUp([Writing], [Writing], [0.9]);

      expect(steal()).to.eql([]);
      expect(rolls).to.eql([0.9]);
    });
  });

  (
    [
      ['switched off', [EVEN_ADVANCE_STEALING, false]],
      ['with the parent switched off', [ENHANCED, false]],
    ] as [string, [string, boolean]][]
  ).forEach(([name, set]): void => {
    describe(`the first from a random place in the list, as v474.05, ${name}`, (): void => {
      it("should walk v474.05's list from where the roll starts it", async (): Promise<void> => {
        const first = await setUp(
            [],
            [Writing, Currency, Alphabet],
            [at(1), 0.9],
            set
          ),
          after = await setUp(
            [],
            [Writing, Currency, Alphabet],
            [at(3), 0.9],
            set
          );

        expect(first.steal()).to.eql([Currency]);
        expect(first.rolls).to.eql([0.9]);
        // Past Currency (2), nothing until Writing (22).
        expect(after.steal()).to.eql([Writing]);
      });

      it('should draw even with nothing to take', async (): Promise<void> => {
        const { rolls, steal } = await setUp(
          [Writing],
          [Writing],
          [at(1), 0.9],
          set
        );

        expect(steal()).to.eql([]);
        expect(rolls).to.eql([0.9]);
      });
    });
  });
});
