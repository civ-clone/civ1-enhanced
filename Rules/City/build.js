"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.raidersOnlyRule = exports.availableToBarbarians = exports.CIVILIZATIONS_NEEDED = exports.hydroPlantSiteRule = void 0;
const Build_1 = require("@civ-clone/core-city-build/Rules/Build");
const Units_1 = require("@civ-clone/civ1-unit/Units");
const RuleIds_1 = require("../../RuleIds");
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const Attack_1 = require("@civ-clone/core-unit/Yields/Attack");
const Yield_1 = require("@civ-clone/core-unit/Rules/Yield");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const CityImprovements_1 = require("@civ-clone/civ1-city-improvement/CityImprovements");
const Types_1 = require("@civ-clone/civ1-unit/Types");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const requiredAdvances_1 = require("@civ-clone/civ1-unit/lib/requiredAdvances");
/**
 * A Hydro Plant is built with Mountains or a River on or next to the city's square, as the manual has it ("on or
 * near"). v474.05 looks only at the eight squares around the city, and not its own (`civ1-city-improvement`'s
 * `city/build/hydro-plant-site`, which this takes the place of while `HYDRO_PLANT_SITE` is on:
 * civ-clone/web-renderer#954).
 */
const hydroPlantSiteRule = () => new Build_1.Build(RuleIds_1.HYDRO_PLANT_SITE_RULE, CityImprovements_1.HydroPlant, new Criterion_1.default((city, BuildItem) => BuildItem === CityImprovements_1.HydroPlant), new Effect_1.default((city) => new Criterion_1.default(() => [city.tile(), ...city.tile().getNeighbours()].some((tile) => tile.terrain() instanceof Terrains_1.Mountains ||
    tile.terrain() instanceof Terrains_1.River))));
exports.hydroPlantSiteRule = hydroPlantSiteRule;
// How many civilizations must be able to build a unit before a barbarian city can.
exports.CIVILIZATIONS_NEEDED = 2;
// A unit type's attack before anything modifies it, by the ruleset's `BaseYield` rules.
const baseAttack = (UnitType, ruleRegistry) => {
    const attack = new Attack_1.default();
    ruleRegistry.process(Yield_1.BaseYield, UnitType, attack);
    return attack.value();
};
/**
 * Whether a barbarian city may build `Item`: a land unit that attacks, other than Settlers, a Diplomat or a Caravan,
 * that at least two civilizations know how to build (civ-clone/web-renderer#27, decision 3). Never a ship, an
 * aircraft or a missile (the barbarians' client moves land units and transports only), an improvement or a Wonder.
 */
const availableToBarbarians = (Item, playerRegistry, playerResearchRegistry, ruleRegistry) => {
    if (!Object.prototype.isPrototypeOf.call(Types_1.Land, Item)) {
        return false;
    }
    const UnitType = Item;
    if (UnitType === Units_1.Settlers ||
        UnitType === Units_1.Diplomat ||
        UnitType === Units_1.Caravan ||
        baseAttack(UnitType, ruleRegistry) <= 0) {
        return false;
    }
    const RequiredAdvance = (0, requiredAdvances_1.requiredAdvanceFor)(UnitType);
    if (RequiredAdvance === null) {
        return true;
    }
    return (playerRegistry
        .entries()
        .filter((player) => !(0, isBarbarian_1.default)(player) &&
        playerResearchRegistry.getByPlayer(player).completed(RequiredAdvance)).length >= exports.CIVILIZATIONS_NEEDED);
};
exports.availableToBarbarians = availableToBarbarians;
/**
 * A barbarian city builds what `availableToBarbarians` allows. v474.05's builds a Warrior while the barbarians have no
 * unit, then Swordmen, and Knights once anyone has Explosives (`civ1-barbarians`' `city/build/raiders-only`, which this
 * takes the place of while `BARBARIAN_CITY_BUILDS` is on: civ-clone/web-renderer#954).
 */
const raidersOnlyRule = (game) => new Build_1.Build(RuleIds_1.RAIDERS_ONLY_RULE, new Criterion_1.default((city) => (0, isBarbarian_1.default)(city.player())), new Effect_1.default((city, Item) => new Criterion_1.default(() => (0, exports.availableToBarbarians)(Item, game.players, game.playerResearch, game.rules))));
exports.raidersOnlyRule = raidersOnlyRule;
const getRules = (game) => [(0, exports.hydroPlantSiteRule)(), (0, exports.raidersOnlyRule)(game)];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build.js.map