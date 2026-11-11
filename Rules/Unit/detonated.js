"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const nuclear_1 = require("@civ-clone/civ1-unit/lib/nuclear");
const Detonated_1 = require("@civ-clone/base-unit-action-nuclear-attack/Rules/Detonated");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const Priority_1 = require("@civ-clone/core-rule/Priority");
/**
 * Every city near a nuclear detonation loses half its size, but one with SDI Defense, which keeps its size as well as
 * its units: SDI Defense stops the whole attack on the city, as players commonly believe and Civ2 has it
 * (civ-clone/web-renderer#129). v474.05 halves it all the same (`civ1-unit`'s `unit/detonated/halve-cities`, which this
 * takes the place of while `SDI_DEFENSE_SPARES_CITIES` is on: civ-clone/web-renderer#960). Fallout never lands on a
 * city's square, and still lands around it. At `civ1-unit`'s `HALVE_CITIES_PRIORITY`, after the units are destroyed
 * and before the fallout, whichever package loads first.
 */
const getRules = (game) => [
    new Detonated_1.default(RuleIds_1.HALVE_CITIES_RULE, new Priority_1.default(nuclear_1.HALVE_CITIES_PRIORITY), new Effect_1.default((unit, tile) => [tile, ...tile.getNeighbours()].forEach((areaTile) => {
        const city = game.cities.getByTile(areaTile);
        if (city === null || (0, nuclear_1.hasSdiDefence)(city, game.cityImprovements)) {
            return;
        }
        (0, nuclear_1.halveCity)(city, unit, game.cityGrowth);
    }))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=detonated.js.map