import { RefusedBuildsGame } from '../../lib/refusedBuilds';
import CitySabotaged from '@civ-clone/base-unit-action-industrial-sabotage/Rules/CitySabotaged';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import Sold from '@civ-clone/core-treasury/Rules/Sold';
/**
 * A build that needed an improvement its city no longer has is dropped as the improvement goes, and its player
 * chooses again (civ-clone/web-renderer#965): a Bank once the Marketplace is sold, a University once the Library is
 * sabotaged, a Power Plant once the Factory can't be paid for. `OBSOLETE_BUILDS`' discovery rule dropped these at the
 * owner's next discovery. "Needed" is a `requires` entry that names the improvement and now refuses the build, in the
 * cities its range speaks for: for an improvement, the city's own.
 *
 * v474.05 goes on building it: completing an improvement checks only its cost, and whether the city has one already
 * (CITYMGT.C `city_process`, `if (townbuf[city].buildings & (1L << (scratch_i - 1))) scratch_i = -1;`); the Marketplace
 * a Bank needs, the Library a University needs and the Factory a Power Plant needs are asked only by `find_slot`'s menu
 * (ECONOMY.C 200). Selling (CITYMGT.C, `townbuf[city].buildings -= 1L << item_b;`), sabotage (DIPLOMAT.C,
 * `townbuf[city_id].buildings &= ~(1 << i);`) and upkeep that can't be paid (CITYMGT.C, `can't maintain`) take the
 * improvement and leave `production` as it was. Nor does the city screen flag it: it flashes the Change button only for
 * an improvement the city has, a spaceship part after launch and a Wonder built elsewhere (CITYMGT.C 1290-1295).
 *
 * The ways an improvement leaves a city, and the rules here that see each:
 * - sold (`core-treasury`'s `PlayerTreasury#sell`): its `Sold` rules, which name it;
 * - sabotaged (`civ1-unit:unit/city-sabotaged/sabotage`): noted before the `CitySabotaged` rules, compared after;
 * - not paid for (`civ1-treasury:city/process-yield/gold`): noted before each `ProcessYield` rule, compared after;
 * - with its city (`City#destroy`, however it comes: starved out while its yields are processed, by its last Settlers,
 *   by a capture): left alone, by every rule here, even when the city is destroyed between a note and its comparison.
 *   Its own builds go with it, and a Wonder lost with its city was still built: v474.05 marks it lost (ECONOMY.C 94-96,
 *   `marvel_site[j] = 0x80`), not unbuilt (`-1`), and its menu asks only whether the Manhattan Project and the Apollo
 *   Program were ever built (ECONOMY.C 172, 202), so Nuclear units and spaceship parts are not dropped either
 *   (civ-clone/web-renderer#965). Wonders are never on the lost side at all (`losableImprovements`): no other way takes
 *   one from a standing city;
 * - with the city's capture (`civ1-city-improvement`'s `Captured` rule): left alone, as the new owner's build is
 *   cleared, or is the item v474.05 lets the human keep, whatever they can build (`civ1-city:city/captured/keep-build`);
 * - made obsolete (Barracks, by `civ1-city-improvement`) or replaced (the Palace, when it moves): nothing needs either.
 *
 * Noted at `High` and compared at `Low`, so the rule that takes the improvement runs between them in whatever order the
 * packages load.
 */
export declare const getRules: (
  game: RefusedBuildsGame
) => (CitySabotaged | ProcessYield | Sold)[];
export default getRules;
