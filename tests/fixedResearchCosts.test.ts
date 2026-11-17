import {
  Alphabet,
  CodeOfLaws,
  FusionPower,
  FutureTechnology,
  Literacy,
  Pottery,
  TheRepublic,
  Writing,
} from '@civ-clone/civ1-science/Advances';
import { Chieftain, Prince } from '@civ-clone/civ1-difficulty/Difficulties';
import loadGame, { Package, pluginOrder } from './lib/loadGame';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import Advance from '@civ-clone/core-science/Advance';
import Client from '@civ-clone/core-client/Client';
import Cost from '@civ-clone/core-science/Rules/Cost';
import { COST_RULE as CIV1_COST_RULE } from '@civ-clone/civ1-science/RuleIds';
import { FIXED_RESEARCH_COSTS } from '../RuleSets';
import { Game } from '@civ-clone/core-game/Game';
import Player from '@civ-clone/core-player/Player';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import { TIERED_COST_RULE } from '../RuleIds';
import Year from '@civ-clone/core-game-year/Year';
import check from '@civ-clone/base-science-research-tiered-cost/lib/check';
import { expect } from 'chai';
import prerequisiteCounts from '@civ-clone/base-science-research-tiered-cost/lib/prerequisites';
import researchTiers from '../ResearchTiers';
import { tierOf } from '@civ-clone/base-science-research-tiered-cost/lib/tiers';

type Setting = {
  on?: boolean;
  Level?: typeof Prince;
  human?: boolean;
  known?: (typeof Advance)[];
  year?: number;
  order?: Package[];
};

// A game with civ1-science and this package, one player knowing `known`, and the set switched as given.
const setUp = ({
  on = true,
  Level = Prince,
  human = true,
  known = [],
  year = -4000,
  order = pluginOrder,
}: Setting = {}) => {
  // No turns played, and an `rng` of 0, so civ1-science gives the player no starting advances.
  const game = loadGame(['civ1-science'], order, {
      rng: (): number => 0,
      turn: { value: (): number => 0 } as unknown as Turn,
      year: { value: (): number => year } as unknown as Year,
    }),
    player = new Player(game.rules),
    // civ1-science's own, made as the player is added.
    playerResearch = game.playerResearch.getByPlayer(player);

  game.ruleSets.set(FIXED_RESEARCH_COSTS, on);
  game.difficulty.set(Level);
  game.clients.register(human ? new Client(player) : new AIClient(player));
  known.forEach((Known) => playerResearch.addAdvance(Known));

  return {
    game,
    // The cost of `AdvanceToResearch`, and the ids of the `Cost` rules that gave it.
    cost: (AdvanceToResearch: typeof Advance) => {
      const rules = game.rules
        .get(Cost)
        .filter((rule) => rule.validate(AdvanceToResearch, playerResearch));

      return {
        rules: rules.map((rule) => rule.id()),
        cost: game.rules.process(Cost, AdvanceToResearch, playerResearch)[0],
      };
    },
  };
};

const advancesOf = (game: Game): (typeof Advance)[] =>
  game.advances.filter((AdvanceType) => !AdvanceType.repeatable);

describe('fixed research costs (civ-clone/web-renderer#1072)', (): void => {
  it("should be off to start with, leaving civ1-science's cost by advances known", (): void => {
    const { game, cost } = setUp({ on: true });

    game.ruleSets.set(FIXED_RESEARCH_COSTS, false);

    expect(game.ruleSets.state(FIXED_RESEARCH_COSTS)).to.equal('off');
    expect(loadGame().ruleSets.state(FIXED_RESEARCH_COSTS)).to.equal('off');
    // Prince, BC, the human's first advance: 1 × max(10, 11 - 1).
    expect(cost(TheRepublic)).to.eql({ rules: [CIV1_COST_RULE], cost: 10 });
  });

  describe('the tiers', (): void => {
    it("should give Civilization's 67 advances a tier each, rising, adding up to what learning them in turn costs", (): void => {
      const { game } = setUp();

      expect(advancesOf(game)).to.have.length(67);
      expect(
        check(advancesOf(game), game.requirements.entries(), researchTiers)
      ).to.eql([]);
    });

    it('should hold as many advances in each tier as the table says', (): void => {
      const { game } = setUp(),
        sizes = researchTiers.map(() => 0);

      prerequisiteCounts(advancesOf(game), game.requirements.entries()).forEach(
        (count: number): void => {
          sizes[tierOf(count, researchTiers)]++;
        }
      );

      expect(sizes).to.eql([7, 10, 11, 8, 6, 9, 6, 10]);
    });
  });

  describe('switched on', (): void => {
    pluginOrder.forEach((first: Package): void => {
      const order: Package[] = [
        first,
        ...pluginOrder.filter((name: Package): boolean => name !== first),
      ];

      it(`should leave exactly one cost rule running, its own, with ${first} loaded first`, (): void => {
        const { cost } = setUp({ order });

        expect(cost(TheRepublic).rules).to.eql([TIERED_COST_RULE]);
      });
    });

    it("should cost an advance its tier's weight times the rate, however few advances are known", (): void => {
      const { cost } = setUp();

      // Prince, BC: a rate of 10, and no floor.
      expect(cost(Pottery).cost).to.equal(40);
      expect(cost(Alphabet).cost).to.equal(40);
      expect(cost(TheRepublic).cost).to.equal(230);
      expect(cost(FusionPower).cost).to.equal(620);
    });

    it('should cost the same whatever else is known', (): void => {
      const { cost } = setUp({
        known: [Alphabet, CodeOfLaws, Writing, Literacy],
      });

      expect(cost(TheRepublic).cost).to.equal(230);
      expect(cost(Pottery).cost).to.equal(40);
    });

    it("should leave out the human's floor at the start", (): void => {
      // Chieftain's rate is 6; civ1-science's first advance would cost 1 × max(6, 10) = 10 a step.
      expect(setUp({ Level: Chieftain }).cost(Alphabet).cost).to.equal(24);
    });

    it("should use the computer players' rate", (): void => {
      // Prince: 14 - 2 = 12.
      expect(setUp({ human: false }).cost(TheRepublic).cost).to.equal(276);
    });

    it('should cost twice as much from AD', (): void => {
      // With no turns played, the leader is far ahead of schedule: catch-up adds what it can, up to 6 a step, only in
      //  AD. Here one advance known less none for the turns gives 1.
      expect(setUp({ year: 1 }).cost(TheRepublic).cost).to.equal(23 * 11 * 2);
    });

    it("should cost Future Technology by civ1-science's rule, which has no tier for it", (): void => {
      const { cost } = setUp({ known: [Alphabet, Writing] });

      // 3 advances known (counted from 1) × max(10, 11 - 3).
      expect(cost(FutureTechnology).cost).to.equal(30);
    });
  });
});
