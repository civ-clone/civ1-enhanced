"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.hydroPlantSiteRule = void 0;
const Build_1 = require("@civ-clone/core-city-build/Rules/Build");
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const CityImprovements_1 = require("@civ-clone/civ1-city-improvement/CityImprovements");
/**
 * A Hydro Plant is built with Mountains or a River on or next to the city's square, as the manual has it ("on or
 * near"). v474.05 looks only at the eight squares around the city, and not its own (`civ1-city-improvement`'s
 * `city/build/hydro-plant-site`, which this takes the place of while `HYDRO_PLANT_SITE` is on:
 * civ-clone/web-renderer#954).
 */
const hydroPlantSiteRule = () => new Build_1.Build('civ1-enhanced:city/build/hydro-plant-site', CityImprovements_1.HydroPlant, new Criterion_1.default((city, BuildItem) => BuildItem === CityImprovements_1.HydroPlant), new Effect_1.default((city) => new Criterion_1.default(() => [city.tile(), ...city.tile().getNeighbours()].some((tile) => tile.terrain() instanceof Terrains_1.Mountains ||
    tile.terrain() instanceof Terrains_1.River))));
exports.hydroPlantSiteRule = hydroPlantSiteRule;
const getRules = () => [(0, exports.hydroPlantSiteRule)()];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build.js.map