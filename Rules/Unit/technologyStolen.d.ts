import { Game } from '@civ-clone/core-game';
import TechnologyStolen from '@civ-clone/base-unit-action-steal-technology/Rules/TechnologyStolen';
/**
 * A Diplomat takes any advance the victim knows and the thief doesn't, each as likely as the next
 * (civ-clone/web-renderer#58): one draw, and only when there is something to take. v474.05 walks its list of advances
 * from a random one and takes the first it can, so an advance after a run the thief knows is likelier (`civ1-unit`'s
 * `unit/technology-stolen/steal`, which this takes the place of while `EVEN_ADVANCE_STEALING` is on:
 * civ-clone/web-renderer#960). Through `civ1-unit`'s `lib/stealAdvance`, so the theft is otherwise the same.
 */
export declare const getRules: (
  game: Pick<
    Game,
    'engine' | 'interactions' | 'playerResearch' | 'rng' | 'rules' | 'turn'
  >
) => TechnologyStolen[];
export default getRules;
