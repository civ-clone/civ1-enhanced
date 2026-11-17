import CatchUp from '@civ-clone/civ1-science/Rules/Research/CatchUp';
import RateMultiplier from '@civ-clone/civ1-science/Rules/Research/RateMultiplier';
import { TiersGame } from '../../lib/advanceTiers';
export declare const getRules: (
  game: TiersGame
) => (RateMultiplier | CatchUp)[];
export default getRules;
