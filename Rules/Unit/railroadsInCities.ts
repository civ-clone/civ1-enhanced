import { Railroad } from '@civ-clone/civ1-world/TileImprovements';
import {
  RAILROAD_IN_CITIES_RULE,
  RAILROAD_ON_BOTH_SQUARES_RULE,
} from '../../RuleIds';
import Action from '@civ-clone/core-unit/Action';
import BuildOnCitySquare from '@civ-clone/civ1-unit/Rules/BuildOnCitySquare';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import { Land } from '@civ-clone/civ1-unit/Types';
import { Move } from '@civ-clone/civ1-unit/Actions';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * Railroads in cities, as the game always had them (civ-clone/web-renderer#1029): Settlers may build a Railroad on a
 * city's square, and a land unit moves for nothing between two squares that both have a Railroad. v474.05 refuses a
 * Railroad on a city's square and moves for nothing from a Railroad to any square with a Road (`civ1-unit`'s rules,
 * which these take the place of while `RAILROADS_IN_CITIES` is on).
 */
export const getRules = (
  game: Pick<Game, 'tileImprovements'>
): (BuildOnCitySquare | MovementCost)[] => {
  const has = (tile: Tile, Improvement: typeof TileImprovement): boolean =>
    game.tileImprovements
      .getByTile(tile)
      .some(
        (improvement: TileImprovement): boolean =>
          improvement instanceof Improvement
      );

  return [
    // What allows a city's Railroad is superseding `civ1-unit`'s refusal: a `BuildOnCitySquare` rule that answers `true`
    //  can't undo another's `false`. This says so where the rules are listed, and gives the set a rule of its own, as a
    //  set with nothing to switch can't be switched.
    new BuildOnCitySquare(
      RAILROAD_IN_CITIES_RULE,
      new Criterion(
        (tile: Tile, Improvement: typeof TileImprovement): boolean =>
          Improvement === Railroad
      ),
      new Effect((): boolean => true)
    ),
    new MovementCost(
      RAILROAD_ON_BOTH_SQUARES_RULE,
      new Criterion(
        (unit: Unit, action: Action): boolean => action instanceof Move
      ),
      new Criterion((unit: Unit): boolean => unit instanceof Land),
      new Criterion((unit: Unit, action: Action): boolean =>
        has(action.from(), Railroad)
      ),
      new Criterion((unit: Unit, action: Action): boolean =>
        has(action.to(), Railroad)
      ),
      new Effect((): number => 0)
    ),
  ];
};

export default getRules;
