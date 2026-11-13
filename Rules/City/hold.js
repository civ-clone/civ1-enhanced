"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Hold_1 = require("@civ-clone/core-city-build/Rules/Hold");
const RuleIds_1 = require("../../RuleIds");
const settlersInSizeOneCity_1 = require("@civ-clone/civ1-unit/lib/settlersInSizeOneCity");
/**
 * A city of size 1 doesn't complete Settlers until it is size 2, at every level and however many cities its player has:
 * the build stays, with its shields, which go on adding up, and is completed the first turn the city is size 2, which
 * the Settlers take it back to (civ-clone/web-renderer#959). A city that can never grow goes on adding shields to a
 * build it can't finish; that is taken over the city destroying itself.
 *
 * v474.05 holds them only on Chieftain (`civ1-unit`'s `city/hold/chieftain-settlers`, which this takes the place of
 * while `SETTLERS_WAIT_FOR_SIZE_TWO` is on). On the other levels it builds them: the player's only city keeps its
 * citizen, and any other is removed, the Settlers staying on its square (`civ1-unit`'s
 * `city/building-complete/settlers-shrink-city`, which never sees a size-1 city while this is on).
 */
const getRules = (game) => [
    new Hold_1.default(RuleIds_1.SETTLERS_WAIT_RULE, 
    // The game's rules, for which types `FoundsCities` (civ1-unit's `lib/settlersInSizeOneCity`).
    new Criterion_1.default((0, settlersInSizeOneCity_1.default)(game.cityGrowth, game.rules))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=hold.js.map