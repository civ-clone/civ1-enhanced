"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advanceTiers = void 0;
const prerequisites_1 = require("@civ-clone/base-science-research-tiered-cost/lib/prerequisites");
const ResearchTiers_1 = require("../ResearchTiers");
const tiers_1 = require("@civ-clone/base-science-research-tiered-cost/lib/tiers");
const kept = new WeakMap();
/**
 * Which of `researchTiers` each advance that can't be repeated is in, by its index, for the fixed costs
 * (civ-clone/web-renderer#1072) and the ages (civ-clone/web-renderer#1076) alike.
 *
 * Read from the game's advances and `requires` entries when first asked for: this package is loaded before
 * `civ1-science`, so they aren't there yet when it registers, and a plugin's changes to them count. Kept for the game
 * only once some advance needs another, so an answer asked for before the entries are added isn't kept for good.
 */
const advanceTiers = (game) => {
    const known = kept.get(game);
    if (known !== undefined) {
        return known;
    }
    const counts = (0, prerequisites_1.default)(game.advances.filter((AdvanceType) => !AdvanceType.repeatable), game.requirements.entries()), tiers = new Map([...counts].map(([AdvanceType, count]) => [
        AdvanceType,
        (0, tiers_1.tierOf)(count, ResearchTiers_1.default),
    ]));
    if ([...counts.values()].some((count) => count > 0)) {
        kept.set(game, tiers);
    }
    return tiers;
};
exports.advanceTiers = advanceTiers;
exports.default = exports.advanceTiers;
//# sourceMappingURL=advanceTiers.js.map