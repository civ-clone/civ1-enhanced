import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import { CLEAR_CAPTURED_BUILD_RULE } from '../../RuleIds';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
import clearCapturedBuild from '@civ-clone/civ1-city/lib/capturedBuild';
import isHuman from '@civ-clone/civ1-difficulty/isHuman';

/**
 * A city the human captures stops building what it was, and the human chooses, as a computer player chooses again
 * (`civ1-city`'s `city/captured/clear-build`): the item was its previous owner's choice, one the human may not be able
 * to build, or want (civ-clone/web-renderer#670, #500). v474.05 leaves the human building it (`civ1-city`'s
 * `city/captured/keep-build`, which this takes the place of while `CAPTURED_CITY_BUILD` is on:
 * civ-clone/web-renderer#954). Cleared through `civ1-city`'s `lib/capturedBuild`, as a computer player's is.
 *
 * It runs after `civ1-city`'s `Captured` rules, as this package registers after it, where `civ1-city`'s own rule
 * cleared it before the city shrank and `city:captured` was emitted. Nothing in between reads or writes the build, and
 * `civ1-city`'s `stop-auto` has already taken the city off Auto, so the `BuildingCancelled` rules choose nothing: the
 * city ends as it did.
 */
export const getRules = (
  game: Pick<Game, 'cityBuilds' | 'clients'>
): Captured[] => [
  new Captured(
    CLEAR_CAPTURED_BUILD_RULE,
    new Criterion((capturedCity: City, capturingPlayer: Player): boolean =>
      isHuman(capturingPlayer, game.clients)
    ),
    new Effect((capturedCity: City): void =>
      clearCapturedBuild(game.cityBuilds.getByCity(capturedCity))
    )
  ),
];

export default getRules;
