"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Captured_1 = require("@civ-clone/core-city/Rules/Captured");
const RuleIds_1 = require("../../RuleIds");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const capturedBuild_1 = require("@civ-clone/civ1-city/lib/capturedBuild");
const isHuman_1 = require("@civ-clone/civ1-difficulty/isHuman");
/**
 * A city the human captures stops building what it was, and the human chooses, as a computer player chooses again
 * (`civ1-city`'s `city/captured/clear-build`): the item was its previous owner's choice, one the human may not be able
 * to build, or want (civ-clone/web-renderer#670, #500). v474.05 leaves the human building it (`civ1-city`'s
 * `city/captured/keep-build`, which this takes the place of while `CAPTURED_CITY_BUILD` is on:
 * civ-clone/web-renderer#954). Cleared through `civ1-city`'s `lib/capturedBuild`, as a computer player's is.
 *
 * It runs after `civ1-city`'s `Captured` rules, as this package registers after it, where `civ1-city`'s own rule
 * cleared it before the city shrank and `city:captured` was emitted. Nothing in between reads or writes the build, and
 * `civ1-city`'s `stop-auto` has already taken the city off Auto, so the `BuildingCancelled` rules choose nothing: the
 * city ends as it did.
 */
const getRules = (game) => [
    new Captured_1.default(RuleIds_1.CLEAR_CAPTURED_BUILD_RULE, new Criterion_1.default((capturedCity, capturingPlayer) => (0, isHuman_1.default)(capturingPlayer, game.clients)), new Effect_1.default((capturedCity) => (0, capturedBuild_1.default)(game.cityBuilds.getByCity(capturedCity)))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=captured.js.map