import Captured from '@civ-clone/core-city/Rules/Captured';
import { Game } from '@civ-clone/core-game';
/** Between `High` (1000) and `Normal` (2000). */
export declare const CAPTURED_BUILD_PRIORITY = 1500;
/**
 * A city the human captures stops building what it was, and the human chooses, as a computer player chooses again
 * (`civ1-city`'s `city/captured/clear-build`): the item was its previous owner's choice, one the human may not be able
 * to build, or want (civ-clone/web-renderer#670, #500). v474.05 leaves the human building it (`civ1-city`'s
 * `city/captured/keep-build`, which this takes the place of while `CAPTURED_CITY_BUILD` is on:
 * civ-clone/web-renderer#954). Cleared through `civ1-city`'s `lib/capturedBuild`, as a computer player's is.
 *
 * `CAPTURED_BUILD_PRIORITY` runs it after the `High` `Captured` rules and before the `Normal` ones, whatever order the
 * packages load in: where `civ1-city`'s own rule cleared the build, before the city shrinks and `city:captured` is
 * raised, so a listener sees the build already cleared. That is ahead of `civ1-city`'s `reset-build-progress` and
 * `stop-auto` too, so it takes the city off Auto itself, as `stop-auto` would, before the `BuildingCancelled` rules
 * could choose for it. Clearing keeps the shields, which `reset-build-progress` then empties, as before.
 */
export declare const getRules: (
  game: Pick<Game, 'cityBuilds' | 'clients'>
) => Captured[];
export default getRules;
