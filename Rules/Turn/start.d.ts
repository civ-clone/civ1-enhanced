import { LandUprisingGame } from '@civ-clone/civ1-barbarians/lib/landUprising';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
/**
 * Each turn one of 128 city slots is drawn, and any civilization's city there may rise, not only the human's
 * (civ-clone/web-renderer#27), through `civ1-barbarians`' `lib/landUprising`, so the units and `barbarians:uprising`
 * are the same. v474.05 lets only the human's rise (`civ1-barbarians`' `turn/start/land-uprising`, which this takes the
 * place of while `BARBARIAN_UPRISINGS` is on: civ-clone/web-renderer#954).
 */
export declare const getRules: (game: LandUprisingGame) => Start[];
export default getRules;
