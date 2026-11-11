import Detonated from '@civ-clone/base-unit-action-nuclear-attack/Rules/Detonated';
import { Game } from '@civ-clone/core-game';
/**
 * Every city near a nuclear detonation loses half its size, but one with SDI Defense, which keeps its size as well as
 * its units: SDI Defense stops the whole attack on the city, as players commonly believe and Civ2 has it
 * (civ-clone/web-renderer#129). v474.05 halves it all the same (`civ1-unit`'s `unit/detonated/halve-cities`, which this
 * takes the place of while `SDI_DEFENSE_SPARES_CITIES` is on: civ-clone/web-renderer#960). Fallout never lands on a
 * city's square, and still lands around it. At `civ1-unit`'s `HALVE_CITIES_PRIORITY`, after the units are destroyed
 * and before the fallout, whichever package loads first.
 */
export declare const getRules: (
  game: Pick<Game, 'cities' | 'cityGrowth' | 'cityImprovements'>
) => Detonated[];
export default getRules;
