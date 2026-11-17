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
import { advanceTiers } from '../../lib/advanceTiers';
import researchTiers from '../../ResearchTiers';
import tieredCost from '@civ-clone/base-science-research-tiered-cost/lib/cost';

/** The parts of a game the cost is read from. */
export type ResearchCostGame = Pick<
  Game,
  | 'advances'
  | 'clients'
  | 'difficulty'
  | 'playerResearch'
  | 'requirements'
  | 'rules'
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
      // Its multiplier and catch-up, which a set can change (civ-clone/web-renderer#1077).
      ruleRegistry: game.rules,
    },
    // Each advance's tier's weight, worked out again only when the tiers are (`advanceTiers`).
    weights = (() => {
      let from: Map<typeof Advance, number> | null = null,
        known = new Map<typeof Advance, number>();

      return (): Map<typeof Advance, number> => {
        const tiers = advanceTiers(game);

        if (tiers !== from) {
          from = tiers;
          known = new Map(
            [...tiers].map(([AdvanceType, tier]): [typeof Advance, number] => [
              AdvanceType,
              researchTiers[tier].weight,
            ])
          );
        }

        return known;
      };
    })();

  return [
    new Cost(
      // The same rate as `civ1-science`'s rule (difficulty, catch-up, doubled from AD), times the advance's weight in
      //  place of the advances known. Without the human's floor of 11 - advances a step: the first tier's weight
      //  already keeps the first advances from costing next to nothing, and keeping the floor too would make the first
      //  advance cost 4 × 10 = 40 at Chieftain, where civ1-science's costs 10 and this one costs 4 × 6 = 24. An advance
      //  with no tier (Future Technology) costs what it does by `civ1-science`'s.
      TIERED_COST_RULE,
      // To the nearest whole bulb, as a multiplier that isn't whole can make it a fraction.
      new Effect((CostAdvance: typeof Advance, playerResearch) =>
        Math.round(
          tieredCost(
            weights(),
            (research) => rate(context, research, false),
            (AnyAdvance, research) => costByAdvancesKnown(context, research)
          )(CostAdvance, playerResearch)
        )
      )
    ),
  ];
};

export default getRules;
