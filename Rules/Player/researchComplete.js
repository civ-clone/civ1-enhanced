"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const CityBuildRegistry_1 = require("@civ-clone/core-city-build/CityBuildRegistry");
const CityRegistry_1 = require("@civ-clone/core-city/CityRegistry");
const Complete_1 = require("@civ-clone/core-science/Rules/Complete");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const getRules = (cityRegistry = CityRegistry_1.instance, cityBuildRegistry = CityBuildRegistry_1.instance) => [
    new Complete_1.default(
    // A discovery can make what a city is building obsolete, as Gunpowder does Spearman: the city stops and its player
    //  chooses again (civ-clone/web-renderer#693). v474.05 goes on building it, as a game does with `OBSOLETE_BUILDS`
    //  off (civ-clone/web-renderer#954).
    //  In plugin order this package loads before civ1-science, so the build is dropped before `player:research-complete`
    //  is raised rather than after, as it was from civ1-unit: the end state is the same.
    RuleIds_1.REVALIDATE_BUILDS_RULE, new Effect_1.default((playerResearch) => cityRegistry
        .getByPlayer(playerResearch.player())
        .forEach((city) => cityBuildRegistry.getByCity(city).revalidate()))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=researchComplete.js.map