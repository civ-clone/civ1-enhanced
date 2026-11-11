import { RefusedBuildsGame } from '../../lib/refusedBuilds';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import Captured from '@civ-clone/core-city/Rules/Captured';
/**
 * A build that something its player has just gained now excludes is dropped as it is gained, and its player chooses
 * again (civ-clone/web-renderer#965): a Power, Hydro or Nuclear Plant under way when its player completes the Hoover
 * Dam, or takes the city that holds it. `OBSOLETE_BUILDS`' discovery rule dropped these at the player's next
 * discovery. "Excludes" is an `excludedBy` entry that names what was gained and now refuses the build, in the cities
 * its range speaks for (`civ1-wonder`'s Hoover Dam entries: its player's).
 *
 * v474.05 goes on building the plant and completes it: completing an improvement checks only its cost and whether the
 * city has one already (CITYMGT.C `city_process`), and the Hoover Dam is asked only by `find_slot`'s menu
 * (ECONOMY.C 192-200, `hoover_power_c`). Nothing chooses again when the dam is completed: only the Wonder itself, in
 * other cities, flashes as built elsewhere (CITYMGT.C 1294).
 *
 * At `Low`, after the rules that put what was built in its registry (`civ1-wonder`'s, for a Wonder) whatever order the
 * packages load in.
 */
export declare const getRules: (
  game: RefusedBuildsGame
) => (BuildingComplete | Captured)[];
export default getRules;
