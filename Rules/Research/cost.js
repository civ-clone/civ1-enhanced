"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const cost_1 = require("@civ-clone/civ1-science/Rules/Research/cost");
const Cost_1 = require("@civ-clone/core-science/Rules/Cost");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const advanceTiers_1 = require("../../lib/advanceTiers");
const ResearchTiers_1 = require("../../ResearchTiers");
const cost_2 = require("@civ-clone/base-science-research-tiered-cost/lib/cost");
const getRules = (game) => {
    const context = {
        gameDifficultyRegistry: game.difficulty,
        clientRegistry: game.clients,
        playerResearchRegistry: game.playerResearch,
        turn: game.turn,
        year: game.year,
        // Its multiplier and catch-up, which a set can change (civ-clone/web-renderer#1077).
        ruleRegistry: game.rules,
    }, 
    // Each advance's tier's weight, worked out again only when the tiers are (`advanceTiers`).
    weights = (() => {
        let from = null, known = new Map();
        return () => {
            const tiers = (0, advanceTiers_1.advanceTiers)(game);
            if (tiers !== from) {
                from = tiers;
                known = new Map([...tiers].map(([AdvanceType, tier]) => [
                    AdvanceType,
                    ResearchTiers_1.default[tier].weight,
                ]));
            }
            return known;
        };
    })();
    return [
        new Cost_1.default(
        // The same rate as `civ1-science`'s rule (difficulty, catch-up, doubled from AD or by age), times the advance's weight in
        //  place of the advances known. Without the human's floor of 11 - advances a step: the first tier's weight
        //  already keeps the first advances from costing next to nothing, and keeping the floor too would make the first
        //  advance cost 4 × 10 = 40 at Chieftain, where civ1-science's costs 10 and this one costs 4 × 6 = 24. An advance
        //  with no tier (Future Technology) costs what it does by `civ1-science`'s.
        RuleIds_1.TIERED_COST_RULE, 
        // To the nearest whole bulb, as a multiplier that isn't whole can make it a fraction.
        new Effect_1.default((CostAdvance, playerResearch) => Math.round((0, cost_2.default)(weights(), (research) => (0, cost_1.rate)(context, research, false), (AnyAdvance, research) => (0, cost_1.costByAdvancesKnown)(context, research))(CostAdvance, playerResearch)))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=cost.js.map