import AgeOf from '@civ-clone/base-science-age/Rules/AgeOf';
import AgeReached from '@civ-clone/base-science-age/Rules/AgeReached';
import Complete from '@civ-clone/core-science/Rules/Complete';
import { Game } from '@civ-clone/core-game/Game';
/** The parts of a game the ages are read from and told to. */
export type AgesGame = Pick<
  Game,
  'advances' | 'engine' | 'requirements' | 'rules' | 'turn'
>;
export declare const getRules: (
  game: AgesGame
) => (AgeOf | Complete | AgeReached)[];
export default getRules;
