import Advance from '@civ-clone/core-science/Advance';
import { Game } from '@civ-clone/core-game/Game';
import prerequisiteCounts from '@civ-clone/base-science-research-tiered-cost/lib/prerequisites';
import researchTiers from '../ResearchTiers';
import { tierOf } from '@civ-clone/base-science-research-tiered-cost/lib/tiers';

/** The parts of a game an advance's tier is read from. */
export type TiersGame = Pick<Game, 'advances' | 'requirements'>;

const kept = new WeakMap<TiersGame, Map<typeof Advance, number>>();

/**
 * Which of `researchTiers` each advance that can't be repeated is in, by its index, for the fixed costs
 * (civ-clone/web-renderer#1072) and the ages (civ-clone/web-renderer#1076) alike.
 *
 * Read from the game's advances and `requires` entries when first asked for: this package is loaded before
 * `civ1-science`, so they aren't there yet when it registers, and a plugin's changes to them count. Kept for the game
 * only once some advance needs another, so an answer asked for before the entries are added isn't kept for good.
 */
export const advanceTiers = (game: TiersGame): Map<typeof Advance, number> => {
  const known = kept.get(game);

  if (known !== undefined) {
    return known;
  }

  const counts = prerequisiteCounts(
      game.advances.filter(
        (AdvanceType: typeof Advance): boolean => !AdvanceType.repeatable
      ),
      game.requirements.entries()
    ),
    tiers = new Map(
      [...counts].map(([AdvanceType, count]): [typeof Advance, number] => [
        AdvanceType,
        tierOf(count, researchTiers),
      ])
    );

  if ([...counts.values()].some((count: number): boolean => count > 0)) {
    kept.set(game, tiers);
  }

  return tiers;
};

export default advanceTiers;
