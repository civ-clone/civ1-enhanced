import BuildOnCitySquare from '@civ-clone/civ1-unit/Rules/BuildOnCitySquare';
import { Game } from '@civ-clone/core-game';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
/**
 * Railroads in cities, as the game always had them (civ-clone/web-renderer#1029): Settlers may build a Railroad on a
 * city's square, and a land unit moves for nothing between two squares that both have a Railroad. v474.05 refuses a
 * Railroad on a city's square and moves for nothing from a Railroad to any square with a Road (`civ1-unit`'s rules,
 * which these take the place of while `RAILROADS_IN_CITIES` is on).
 */
export declare const getRules: (
  game: Pick<Game, 'tileImprovements'>
) => (BuildOnCitySquare | MovementCost)[];
export default getRules;
