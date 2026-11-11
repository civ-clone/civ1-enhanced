"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const ProcessYield_1 = require("@civ-clone/core-city/Rules/ProcessYield");
const Yields_1 = require("@civ-clone/civ1-city-improvement/Yields");
const pollute_1 = require("@civ-clone/civ1-city-improvement/lib/pollute");
/**
 * Each turn every city with pollution may pollute one of the 20 squares around it, the computer players' as well as the
 * human's (Dom's decision on civ-clone/web-renderer#32), through `civ1-city-improvement`'s `lib/pollute`. v474.05
 * rolls only for the human's cities (`civ1-city-improvement`'s `city/process-yield/pollution`, which this takes the
 * place of while `POLLUTION_IN_EVERY_CITY` is on: civ-clone/web-renderer#954).
 */
const getRules = (game) => [
    new ProcessYield_1.default(RuleIds_1.POLLUTION_RULE, 
    // Once a turn: the consolidated shields are processed once per city.
    new Criterion_1.default((cityYield) => cityYield instanceof Yields_1.Production), new Effect_1.default((cityYield, city, cityYields) => (0, pollute_1.default)(city, cityYields, {
        cityRegistry: game.cities,
        cityImprovementRegistry: game.cityImprovements,
        cityGrowthRegistry: game.cityGrowth,
        playerResearchRegistry: game.playerResearch,
        tileImprovementRegistry: game.tileImprovements,
        gameDifficultyRegistry: game.difficulty,
        ruleRegistry: game.rules,
        engine: game.engine,
        randomNumberGenerator: game.rng,
    }))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=processYield.js.map