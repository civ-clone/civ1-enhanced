"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.latestTier = void 0;
const advanceTiers_1 = require("./advanceTiers");
/**
 * The latest research tier `playerResearch`'s player knows an advance of, by its index in `ResearchTiers`, and the
 * first knowing none: the index of the age it is in (`Ages`). Worked out from the tiers rather than asked of the ages'
 * own rule, so it holds whether the ages are switched on or not.
 */
const latestTier = (game, playerResearch) => {
    const tiers = (0, advanceTiers_1.advanceTiers)(game);
    return playerResearch
        .complete()
        .reduce((latest, advance) => { var _a; return Math.max(latest, (_a = tiers.get(advance.sourceClass())) !== null && _a !== void 0 ? _a : 0); }, 0);
};
exports.latestTier = latestTier;
exports.default = exports.latestTier;
//# sourceMappingURL=latestTier.js.map