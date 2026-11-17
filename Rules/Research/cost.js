"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const cost_1 = require("@civ-clone/civ1-science/Rules/Research/cost");
const Cost_1 = require("@civ-clone/core-science/Rules/Cost");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const prerequisites_1 = require("@civ-clone/base-science-research-tiered-cost/lib/prerequisites");
const ResearchTiers_1 = require("../../ResearchTiers");
const cost_2 = require("@civ-clone/base-science-research-tiered-cost/lib/cost");
const tiers_1 = require("@civ-clone/base-science-research-tiered-cost/lib/tiers");
const getRules = (game) => {
    const context = {
        gameDifficultyRegistry: game.difficulty,
        clientRegistry: game.clients,
        playerResearchRegistry: game.playerResearch,
        turn: game.turn,
        year: game.year,
    }, 
    // Read from the game's advances and `requires` entries when the first cost is asked for: this package is loaded
    //  before `civ1-science`, so they aren't there yet when it registers, and a plugin's changes to them count. Kept
    //  only once some advance needs another, so a cost asked for before the entries are added isn't kept for good.
    weights = (() => {
        let known = null;
        return () => {
            if (known !== null) {
                return known;
            }
            const counts = (0, prerequisites_1.default)(game.advances.filter((AdvanceType) => !AdvanceType.repeatable), game.requirements.entries()), found = (0, tiers_1.weightsFor)(counts, ResearchTiers_1.default);
            if ([...counts.values()].some((count) => count > 0)) {
                known = found;
            }
            return found;
        };
    })();
    return [
        new Cost_1.default(
        // The same rate as `civ1-science`'s rule (difficulty, catch-up, doubled from AD), times the advance's weight in
        //  place of the advances known. Without the human's floor of 11 - advances a step: the first tier's weight
        //  already keeps the first advances from costing next to nothing, and keeping the floor too would make the first
        //  advance cost 4 × 10 = 40 at Chieftain, where civ1-science's costs 10 and this one costs 4 × 6 = 24. An advance
        //  with no tier (Future Technology) costs what it does by `civ1-science`'s.
        RuleIds_1.TIERED_COST_RULE, new Effect_1.default((CostAdvance, playerResearch) => (0, cost_2.default)(weights(), (research) => (0, cost_1.rate)(context, research, false), (AnyAdvance, research) => (0, cost_1.costByAdvancesKnown)(context, research))(CostAdvance, playerResearch))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=cost.js.map