import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import { POLLUTION_RULE } from '../../RuleIds';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import { Production } from '@civ-clone/civ1-city-improvement/Yields';
import Yield from '@civ-clone/core-yield/Yield';
import pollute from '@civ-clone/civ1-city-improvement/lib/pollute';

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
export const getRules = (game: PollutionGame): ProcessYield[] => [
  new ProcessYield(
    POLLUTION_RULE,
    // Once a turn: the consolidated shields are processed once per city.
    new Criterion(
      (cityYield: Yield): boolean => cityYield instanceof Production
    ),
    new Effect((cityYield: Yield, city: City, cityYields: Yield[]): void =>
      pollute(city, cityYields, {
        cityRegistry: game.cities,
        cityImprovementRegistry: game.cityImprovements,
        cityGrowthRegistry: game.cityGrowth,
        playerResearchRegistry: game.playerResearch,
        tileImprovementRegistry: game.tileImprovements,
        gameDifficultyRegistry: game.difficulty,
        ruleRegistry: game.rules,
        engine: game.engine,
        randomNumberGenerator: game.rng,
      })
    )
  ),
];

export default getRules;
