import { BuildableInstance } from '@civ-clone/core-city-build/Buildable';
import {
  DROP_EXCLUDED_BUILDS_CAPTURED_RULE,
  DROP_EXCLUDED_BUILDS_COMPLETE_RULE,
} from '../../RuleIds';
import {
  RefusedBuildsGame,
  dropBuildsFor,
  entriesNaming,
  possessions,
} from '../../lib/refusedBuilds';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Effect from '@civ-clone/core-rule/Effect';
import Low from '@civ-clone/core-rule/Priorities/Low';
import Player from '@civ-clone/core-player/Player';
import { Requirement } from '@civ-clone/core-requirement/Requirement';

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
export const getRules = (
  game: RefusedBuildsGame
): (BuildingComplete | Captured)[] => [
  new BuildingComplete(
    DROP_EXCLUDED_BUILDS_COMPLETE_RULE,
    new Low(),
    new Effect((cityBuild: CityBuild, built: BuildableInstance): void => {
      const city = cityBuild.city();

      // A completion that takes its own city with it (Settlers from a city of size 1) gains its player nothing there.
      if (city.destroyed()) {
        return;
      }

      dropBuildsFor(
        game,
        entriesNaming(game, 'excludedBy', built),
        city,
        city.player()
      );
    })
  ),

  // What the captured city holds is the captor's now. The captured city itself is left to what
  //  `CAPTURED_CITY_BUILD` decides for it: its build is cleared, or kept as v474.05 keeps it.
  new Captured(
    DROP_EXCLUDED_BUILDS_CAPTURED_RULE,
    new Low(),
    new Effect((capturedCity: City, capturingPlayer: Player): void => {
      if (capturedCity.destroyed()) {
        return;
      }

      dropBuildsFor(
        game,
        Array.from(
          new Set(
            possessions(game, capturedCity).flatMap(
              (improvement: CityImprovement): Requirement[] =>
                entriesNaming(game, 'excludedBy', improvement)
            )
          )
        ),
        capturedCity,
        capturingPlayer,
        capturedCity
      );
    })
  ),
];

export default getRules;
