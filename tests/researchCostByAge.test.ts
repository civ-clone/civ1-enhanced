import {
  Alphabet,
  Banking,
  TheRepublic,
  Writing,
} from '@civ-clone/civ1-science/Advances';
import { FIXED_RESEARCH_COSTS, RESEARCH_COST_BY_AGE } from '../RuleSets';
import Advance from '@civ-clone/core-science/Advance';
import Client from '@civ-clone/core-client/Client';
import Cost from '@civ-clone/core-science/Rules/Cost';
import Player from '@civ-clone/core-player/Player';
import { Prince } from '@civ-clone/civ1-difficulty/Difficulties';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Year from '@civ-clone/core-game-year/Year';
import { CATCH_UP_FROM_RENAISSANCE_RULE } from '../RuleIds';
import { ageRateMultipliers } from '../AgeResearchRates';
import { expect } from 'chai';
import loadGame from './lib/loadGame';

// The human at Prince (10 a step), knowing `known`, with the sets switched as given, in `year` on `turn`.
const setUp = ({
  byAge = true,
  fixed = false,
  known = [] as (typeof Advance)[],
  year = -4000,
  turn = 0,
} = {}) => {
  const game = loadGame(['civ1-science'], undefined, {
      rng: (): number => 0,
      turn: { value: (): number => turn } as unknown as Turn,
      year: { value: (): number => year } as unknown as Year,
    }),
    player = new Player(game.rules),
    playerResearch = game.playerResearch.getByPlayer(player);

  game.ruleSets.set(RESEARCH_COST_BY_AGE, byAge);
  game.ruleSets.set(FIXED_RESEARCH_COSTS, fixed);
  game.difficulty.set(Prince);
  game.clients.register(new Client(player));
  known.forEach((Known) => playerResearch.addAdvance(Known));

  return {
    game,
    playerResearch,
    cost: (AdvanceType: typeof Advance): number =>
      game.rules.process(Cost, AdvanceType, playerResearch)[0],
  };
};

describe('research cost by age (civ-clone/web-renderer#1077)', (): void => {
  it('should be off to start with', (): void => {
    const game = loadGame(['civ1-science']);

    expect(game.ruleSets.state(RESEARCH_COST_BY_AGE)).to.equal('off');
  });

  it('should slide from 0.5 to 3 over the eight ages', (): void => {
    expect(ageRateMultipliers).to.have.length(8);
    expect(ageRateMultipliers[0]).to.equal(0.5);
    expect(ageRateMultipliers[7]).to.equal(3);
    ageRateMultipliers
      .slice(1)
      .forEach((multiplier, index) =>
        expect(multiplier).to.be.above(ageRateMultipliers[index])
      );
  });

  it("should multiply today's cost by the player's age's, and not double it in AD", (): void => {
    // The second advance: 2 × 10 a step, × 0.5 in the Ancient Age; in AD too.
    expect(setUp({ known: [Alphabet] }).cost(Writing)).to.equal(10);
    expect(
      setUp({ known: [Alphabet], year: 1, turn: 900 }).cost(Writing)
    ).to.equal(10);
    // Knowing The Republic, the Medieval Age: 2 × 10 × 0.83 = 16.6, to 17, for any advance, Writing too.
    expect(setUp({ known: [TheRepublic] }).cost(Writing)).to.equal(17);
  });

  it('should leave the cost as it was with the set off', (): void => {
    expect(setUp({ byAge: false, known: [Alphabet] }).cost(Writing)).to.equal(
      20
    );
    expect(
      setUp({ byAge: false, known: [Alphabet], year: 1, turn: 900 }).cost(
        Writing
      )
    ).to.equal(40);
  });

  it("should multiply the fixed costs by the player's age's too", (): void => {
    // Writing is in the second tier, weight 12: 12 × 10 × 0.5 = 60, and 12 × 10 = 120 with the set off.
    expect(setUp({ fixed: true, known: [Alphabet] }).cost(Writing)).to.equal(
      60
    );
    expect(
      setUp({ fixed: true, byAge: false, known: [Alphabet] }).cost(Writing)
    ).to.equal(120);
  });

  it("should add catch-up from the player's own Renaissance, in BC too, and not before it in AD", (): void => {
    // Knowing Banking, the Renaissance, on turn 0: catch-up is 2 (advances, plus one) - 0, so 12 a step, × 1.08;
    //  the fixed cost of Writing, 12 × 12.96 = 155.52, to 156.
    expect(setUp({ fixed: true, known: [Banking] }).cost(Writing)).to.equal(
      156
    );
    // Knowing The Republic, the Medieval Age, in AD on turn 0: no catch-up, 12 × 10 × 0.83 = 99.6, to 100.
    expect(
      setUp({ fixed: true, known: [TheRepublic], year: 1 }).cost(Writing)
    ).to.equal(100);
  });

  it("should leave the other half as civ1-science's with only one of its rules switched on", (): void => {
    // Only the catch-up from the Renaissance: in AD, doubled as v474.05's, 2 × 10 × 2 = 40, not × 0.5.
    const { game, cost } = setUp({
      byAge: false,
      known: [Alphabet],
      year: 1,
      turn: 900,
    });

    game.ruleSets.set(CATCH_UP_FROM_RENAISSANCE_RULE, true);

    expect(game.ruleSets.state(RESEARCH_COST_BY_AGE)).to.equal('mixed');
    expect(cost(Writing)).to.equal(40);
  });

  it('should price the advance that starts a new age at the age before', (): void => {
    const { playerResearch } = setUp({ known: [Alphabet] });

    playerResearch.research(TheRepublic);

    // The second advance in the Ancient Age: 2 × 10 × 0.5.
    expect(playerResearch.cost().value()).to.equal(10);
  });
});
