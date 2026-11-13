import { Build } from '@civ-clone/core-city-build/Rules/Build';
import { Game } from '@civ-clone/core-game';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * A Hydro Plant is built with Mountains or a River on or next to the city's square, as the manual has it ("on or
 * near"). v474.05 looks only at the eight squares around the city, and not its own (`civ1-city-improvement`'s
 * `city/build/hydro-plant-site`, which this takes the place of while `HYDRO_PLANT_SITE` is on:
 * civ-clone/web-renderer#954).
 */
export declare const hydroPlantSiteRule: () => Build;
export declare const CIVILIZATIONS_NEEDED = 2;
/**
 * Settlers, Diplomats and Caravans, which barbarians never build: the types that, in `ruleRegistry`, the game's rules,
 * found cities or are `NonCombatant`.
 */
export declare const neverBarbarian: (
  UnitType: typeof Unit,
  ruleRegistry: RuleRegistry
) => boolean;
/**
 * Whether a barbarian city may build `Item`: a land unit that attacks, other than Settlers, a Diplomat or a Caravan,
 * that at least two civilizations know how to build (civ-clone/web-renderer#27, decision 3). Never a ship, an
 * aircraft or a missile (the barbarians' client moves land units and transports only), an improvement or a Wonder.
 */
export declare const availableToBarbarians: (
  Item: IConstructor,
  playerRegistry: Pick<PlayerRegistry, 'entries'>,
  playerResearchRegistry: Pick<PlayerResearchRegistry, 'getByPlayer'>,
  ruleRegistry: RuleRegistry
) => boolean;
/**
 * A barbarian city builds what `availableToBarbarians` allows. v474.05's builds a Warrior while the barbarians have no
 * unit, then Swordmen, and Knights once anyone has Explosives (`civ1-barbarians`' `city/build/raiders-only`, which this
 * takes the place of while `BARBARIAN_CITY_BUILDS` is on: civ-clone/web-renderer#954).
 */
export declare const raidersOnlyRule: (
  game: Pick<Game, 'players' | 'playerResearch' | 'rules'>
) => Build;
export declare const getRules: (
  game: Pick<Game, 'players' | 'playerResearch' | 'rules'>
) => Build[];
export default getRules;
