import Captured from '@civ-clone/core-city/Rules/Captured';
import { Game } from '@civ-clone/core-game';
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
export declare const getRules: (
  game: Pick<Game, 'cityBuilds' | 'clients'>
) => Captured[];
export default getRules;
