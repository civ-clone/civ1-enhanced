import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import { HYDRO_PLANT_SITE_RULE, RAIDERS_ONLY_RULE } from '../../RuleIds';
import { Mountains, River } from '@civ-clone/civ1-world/Terrains';
import Attack from '@civ-clone/core-unit/Yields/Attack';
import { BaseYield } from '@civ-clone/core-unit/Rules/Yield';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import FoundsCities from '@civ-clone/base-unit-trait-founds-cities/FoundsCities';
import { Game } from '@civ-clone/core-game';
import { HydroPlant } from '@civ-clone/civ1-city-improvement/CityImprovements';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import { Land } from '@civ-clone/civ1-unit/Types';
import NonCombatant from '@civ-clone/base-unit-trait-non-combatant/NonCombatant';
import Player from '@civ-clone/core-player/Player';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { hasTrait } from '@civ-clone/core-unit/traits';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import { requiredAdvanceFor } from '@civ-clone/civ1-unit/lib/requiredAdvances';

/**
 * A Hydro Plant is built with Mountains or a River on or next to the city's square, as the manual has it ("on or
 * near"). v474.05 looks only at the eight squares around the city, and not its own (`civ1-city-improvement`'s
 * `city/build/hydro-plant-site`, which this takes the place of while `HYDRO_PLANT_SITE` is on:
 * civ-clone/web-renderer#954).
 */
export const hydroPlantSiteRule = (): Build =>
  new Build(
    HYDRO_PLANT_SITE_RULE,
    HydroPlant,
    new Criterion(
      (city: City, BuildItem: IConstructor): boolean => BuildItem === HydroPlant
    ),
    new Effect(
      (city: City): IBuildCriterion =>
        new Criterion((): boolean =>
          [city.tile(), ...city.tile().getNeighbours()].some(
            (tile: Tile): boolean =>
              tile.terrain() instanceof Mountains ||
              tile.terrain() instanceof River
          )
        )
    )
  );

// How many civilizations must be able to build a unit before a barbarian city can.
export const CIVILIZATIONS_NEEDED = 2;

// A unit type's attack before anything modifies it, by the ruleset's `BaseYield` rules.
const baseAttack = (
  UnitType: typeof Unit,
  ruleRegistry: RuleRegistry
): number => {
  const attack = new Attack();

  ruleRegistry.process(BaseYield, UnitType, attack);

  return attack.value();
};

/**
 * Settlers, Diplomats and Caravans, which barbarians never build: the types that, in `ruleRegistry`, the game's rules,
 * found cities or are `NonCombatant`.
 */
export const neverBarbarian = (
  UnitType: typeof Unit,
  ruleRegistry: RuleRegistry
): boolean =>
  hasTrait(UnitType, FoundsCities, ruleRegistry) ||
  hasTrait(UnitType, NonCombatant, ruleRegistry);

/**
 * Whether a barbarian city may build `Item`: a land unit that attacks, other than Settlers, a Diplomat or a Caravan,
 * that at least two civilizations know how to build (civ-clone/web-renderer#27, decision 3). Never a ship, an
 * aircraft or a missile (the barbarians' client moves land units and transports only), an improvement or a Wonder.
 */
export const availableToBarbarians = (
  Item: IConstructor,
  playerRegistry: Pick<PlayerRegistry, 'entries'>,
  playerResearchRegistry: Pick<PlayerResearchRegistry, 'getByPlayer'>,
  ruleRegistry: RuleRegistry
): boolean => {
  if (!Object.prototype.isPrototypeOf.call(Land, Item)) {
    return false;
  }

  const UnitType = Item as unknown as typeof Unit;

  if (
    neverBarbarian(UnitType, ruleRegistry) ||
    baseAttack(UnitType, ruleRegistry) <= 0
  ) {
    return false;
  }

  const RequiredAdvance = requiredAdvanceFor(UnitType);

  if (RequiredAdvance === null) {
    return true;
  }

  return (
    playerRegistry
      .entries()
      .filter(
        (player: Player): boolean =>
          !isBarbarian(player) &&
          playerResearchRegistry.getByPlayer(player).completed(RequiredAdvance)
      ).length >= CIVILIZATIONS_NEEDED
  );
};

/**
 * A barbarian city builds what `availableToBarbarians` allows. v474.05's builds a Warrior while the barbarians have no
 * unit, then Swordmen, and Knights once anyone has Explosives (`civ1-barbarians`' `city/build/raiders-only`, which this
 * takes the place of while `BARBARIAN_CITY_BUILDS` is on: civ-clone/web-renderer#954).
 */
export const raidersOnlyRule = (
  game: Pick<Game, 'players' | 'playerResearch' | 'rules'>
): Build =>
  new Build(
    RAIDERS_ONLY_RULE,
    new Criterion((city: City): boolean => isBarbarian(city.player())),
    new Effect(
      (city: City, Item: IConstructor): IBuildCriterion =>
        new Criterion((): boolean =>
          availableToBarbarians(
            Item,
            game.players,
            game.playerResearch,
            game.rules
          )
        )
    )
  );

export const getRules = (
  game: Pick<Game, 'players' | 'playerResearch' | 'rules'>
): Build[] => [hydroPlantSiteRule(), raidersOnlyRule(game)];

export default getRules;
