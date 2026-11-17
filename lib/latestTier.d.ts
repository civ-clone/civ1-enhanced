import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import { TiersGame } from './advanceTiers';
/**
 * The latest research tier `playerResearch`'s player knows an advance of, by its index in `ResearchTiers`, and the
 * first knowing none: the index of the age it is in (`Ages`). Worked out from the tiers rather than asked of the ages'
 * own rule, so it holds whether the ages are switched on or not.
 */
export declare const latestTier: (
  game: TiersGame,
  playerResearch: PlayerResearch
) => number;
export default latestTier;
