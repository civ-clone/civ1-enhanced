"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const AdvanceCount_1 = require("@civ-clone/core-science/Rules/AdvanceCount");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const getRules = () => [
    // Every advance known counts, those the player started with too, as the game always counted them: v474.05 counts
    //  only those gained in play (`civ1-science`'s rule).
    new AdvanceCount_1.default(RuleIds_1.EVERY_ADVANCE_COUNT_RULE, new Effect_1.default((playerResearch) => playerResearch.complete().length)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=advanceCount.js.map