"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const landUprising_1 = require("@civ-clone/civ1-barbarians/lib/landUprising");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const Start_1 = require("@civ-clone/core-turn-based-game/Rules/Start");
const spawning_1 = require("@civ-clone/civ1-barbarians/lib/spawning");
/**
 * Each turn one of 128 city slots is drawn, and any civilization's city there may rise, not only the human's
 * (civ-clone/web-renderer#27), through `civ1-barbarians`' `lib/landUprising`, so the units and `barbarians:uprising`
 * are the same. v474.05 lets only the human's rise (`civ1-barbarians`' `turn/start/land-uprising`, which this takes the
 * place of while `BARBARIAN_UPRISINGS` is on: civ-clone/web-renderer#954).
 */
const getRules = (game) => [
    new Start_1.default(RuleIds_1.LAND_UPRISING_RULE, new Criterion_1.default((turn) => (0, spawning_1.default)(game.rules, turn)), new Effect_1.default(() => (0, landUprising_1.default)(game, () => true))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=start.js.map