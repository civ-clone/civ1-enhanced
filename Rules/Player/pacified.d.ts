import { Game } from '@civ-clone/core-game';
import Pacified from '@civ-clone/library-diplomacy/Rules/Player/Pacified';
/**
 * Every other leader is pacified towards the owner of the United Nations, a computer player's too, so two computer
 * players that meet never go to war over it either (civ-clone/web-renderer#30). v474.05 pacifies a leader only towards
 * a human owner, in the human's parley (`civ1-wonder`'s `player/pacified/united-nations`, which this takes the place of
 * while `UNITED_NATIONS_STOPS_COMPUTER_WARS` is on: civ-clone/web-renderer#960). The Great Wall's rule is v474.05's
 * already, between computer players too.
 */
export declare const getRules: (
  game: Pick<Game, 'playerResearch' | 'requirements' | 'wonders'>
) => Pacified[];
export default getRules;
