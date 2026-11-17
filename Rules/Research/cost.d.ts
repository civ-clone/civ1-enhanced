import Cost from '@civ-clone/core-science/Rules/Cost';
import { Game } from '@civ-clone/core-game/Game';
/** The parts of a game the cost is read from. */
export type ResearchCostGame = Pick<
  Game,
  | 'advances'
  | 'clients'
  | 'difficulty'
  | 'playerResearch'
  | 'requirements'
  | 'rules'
  | 'turn'
  | 'year'
>;
export declare const getRules: (game: ResearchCostGame) => Cost[];
export default getRules;
