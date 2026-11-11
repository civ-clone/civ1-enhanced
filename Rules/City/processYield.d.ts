import { Game } from '@civ-clone/core-game';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
export type PollutionGame = Pick<
  Game,
  | 'cities'
  | 'cityImprovements'
  | 'cityGrowth'
  | 'difficulty'
  | 'engine'
  | 'playerResearch'
  | 'rng'
  | 'rules'
  | 'tileImprovements'
>;
/**
 * Each turn every city with pollution may pollute one of the 20 squares around it, the computer players' as well as the
 * human's (Dom's decision on civ-clone/web-renderer#32), through `civ1-city-improvement`'s `lib/pollute`. v474.05
 * rolls only for the human's cities (`civ1-city-improvement`'s `city/process-yield/pollution`, which this takes the
 * place of while `POLLUTION_IN_EVERY_CITY` is on: civ-clone/web-renderer#954).
 */
export declare const getRules: (game: PollutionGame) => ProcessYield[];
export default getRules;
