import { ageRateMultipliers, catchUpFromTier } from '../../AgeResearchRates';
import {
  CATCH_UP_FROM_RENAISSANCE_RULE,
  RATE_MULTIPLIER_BY_AGE_RULE,
} from '../../RuleIds';
import CatchUp from '@civ-clone/civ1-science/Rules/Research/CatchUp';
import Effect from '@civ-clone/core-rule/Effect';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import RateMultiplier from '@civ-clone/civ1-science/Rules/Research/RateMultiplier';
import { TiersGame } from '../../lib/advanceTiers';
import latestTier from '../../lib/latestTier';

export const getRules = (game: TiersGame): (RateMultiplier | CatchUp)[] => [
  // The player's own age's multiplier, so a rush into a later age makes every advance after it dearer, the ones left
  //  behind too.
  new RateMultiplier(
    RATE_MULTIPLIER_BY_AGE_RULE,
    new Effect(
      (playerResearch: PlayerResearch): number =>
        ageRateMultipliers[latestTier(game, playerResearch)]
    )
  ),
  // v474.05's catch-up, for a player once it is in the Renaissance or later, rather than for everyone from AD.
  new CatchUp(
    CATCH_UP_FROM_RENAISSANCE_RULE,
    new Effect(
      (playerResearch: PlayerResearch): boolean =>
        latestTier(game, playerResearch) >= catchUpFromTier
    )
  ),
];

export default getRules;
