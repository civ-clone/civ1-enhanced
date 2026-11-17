import {
  CostContext,
  costByAdvancesKnown,
  rate,
} from '@civ-clone/civ1-science/Rules/Research/cost';
import Advance from '@civ-clone/core-science/Advance';
import Cost from '@civ-clone/core-science/Rules/Cost';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game/Game';
import { TIERED_COST_RULE } from '../../RuleIds';
import prerequisiteCounts from '@civ-clone/base-science-research-tiered-cost/lib/prerequisites';
import researchTiers from '../../ResearchTiers';
import tieredCost from '@civ-clone/base-science-research-tiered-cost/lib/cost';
import { weightsFor } from '@civ-clone/base-science-research-tiered-cost/lib/tiers';

/** The parts of a game the cost is read from. */
export type ResearchCostGame = Pick<
  Game,
  | 'advances'
  | 'clients'
  | 'difficulty'
  | 'playerResearch'
  | 'requirements'
  | 'turn'
  | 'year'
>;

export const getRules = (game: ResearchCostGame): Cost[] => {
  const context: CostContext = {
      gameDifficultyRegistry: game.difficulty,
      clientRegistry: game.clients,
      playerResearchRegistry: game.playerResearch,
      turn: game.turn,
      year: game.year,
    },
    // Read from the game's advances and `requires` entries when the first cost is asked for: this package is loaded
    //  before `civ1-science`, so they aren't there yet when it registers, and a plugin's changes to them count. Kept
    //  only once some advance needs another, so a cost asked for before the entries are added isn't kept for good.
    weights = (() => {
      let known: Map<typeof Advance, number> | null = null;

      return (): Map<typeof Advance, number> => {
        if (known !== null) {
          return known;
        }

        const counts = prerequisiteCounts(
            game.advances.filter(
              (AdvanceType: typeof Advance): boolean => !AdvanceType.repeatable
            ),
            game.requirements.entries()
          ),
          found = weightsFor(counts, researchTiers);

        if ([...counts.values()].some((count: number): boolean => count > 0)) {
          known = found;
        }

        return found;
      };
    })();

  return [
    new Cost(
      // The same rate as `civ1-science`'s rule (difficulty, catch-up, doubled from AD), times the advance's weight in
      //  place of the advances known. Without the human's floor of 11 - advances a step: the first tier's weight
      //  already keeps the first advances from costing next to nothing, and keeping the floor too would make the first
      //  advance cost 4 × 10 = 40 at Chieftain, where civ1-science's costs 10 and this one costs 4 × 6 = 24. An advance with no tier (Future Technology) costs what it does by `civ1-science`'s.
      TIERED_COST_RULE,
      new Effect((CostAdvance: typeof Advance, playerResearch) =>
        tieredCost(
          weights(),
          (research) => rate(context, research, false),
          (AnyAdvance, research) => costByAdvancesKnown(context, research)
        )(CostAdvance, playerResearch)
      )
    ),
  ];
};

export default getRules;
