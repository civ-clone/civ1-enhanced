import {
  HALVE_CITIES_PRIORITY,
  halveCity,
  hasSdiDefence,
} from '@civ-clone/civ1-unit/lib/nuclear';
import Detonated from '@civ-clone/base-unit-action-nuclear-attack/Rules/Detonated';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import { HALVE_CITIES_RULE } from '../../RuleIds';
import Priority from '@civ-clone/core-rule/Priority';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * Every city near a nuclear detonation loses half its size, but one with SDI Defense, which keeps its size as well as
 * its units: SDI Defense stops the whole attack on the city, as players commonly believe and Civ2 has it
 * (civ-clone/web-renderer#129). v474.05 halves it all the same (`civ1-unit`'s `unit/detonated/halve-cities`, which this
 * takes the place of while `SDI_DEFENSE_SPARES_CITIES` is on: civ-clone/web-renderer#960). Fallout never lands on a
 * city's square, and still lands around it. At `civ1-unit`'s `HALVE_CITIES_PRIORITY`, after the units are destroyed
 * and before the fallout, whichever package loads first.
 */
export const getRules = (
  game: Pick<Game, 'cities' | 'cityGrowth' | 'cityImprovements'>
): Detonated[] => [
  new Detonated(
    HALVE_CITIES_RULE,
    new Priority(HALVE_CITIES_PRIORITY),
    new Effect((unit: Unit, tile: Tile): void =>
      [tile, ...tile.getNeighbours()].forEach((areaTile: Tile): void => {
        const city = game.cities.getByTile(areaTile);

        if (city === null || hasSdiDefence(city, game.cityImprovements)) {
          return;
        }

        halveCity(city, unit, game.cityGrowth);
      })
    )
  ),
];

export default getRules;
