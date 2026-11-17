"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const AgeResearchRates_1 = require("../../AgeResearchRates");
const RuleIds_1 = require("../../RuleIds");
const CatchUp_1 = require("@civ-clone/civ1-science/Rules/Research/CatchUp");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RateMultiplier_1 = require("@civ-clone/civ1-science/Rules/Research/RateMultiplier");
const latestTier_1 = require("../../lib/latestTier");
const getRules = (game) => [
    // The player's own age's multiplier, so a rush into a later age makes every advance after it dearer, the ones left
    //  behind too.
    new RateMultiplier_1.default(RuleIds_1.RATE_MULTIPLIER_BY_AGE_RULE, new Effect_1.default((playerResearch) => AgeResearchRates_1.ageRateMultipliers[(0, latestTier_1.default)(game, playerResearch)])),
    // v474.05's catch-up, for a player once it is in the Renaissance or later, rather than for everyone from AD.
    new CatchUp_1.default(RuleIds_1.CATCH_UP_FROM_RENAISSANCE_RULE, new Effect_1.default((playerResearch) => (0, latestTier_1.default)(game, playerResearch) >= AgeResearchRates_1.catchUpFromTier)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=rateByAge.js.map