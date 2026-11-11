"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const RuleIds_1 = require("../../RuleIds");
const refusedBuilds_1 = require("../../lib/refusedBuilds");
const CitySabotaged_1 = require("@civ-clone/base-unit-action-industrial-sabotage/Rules/CitySabotaged");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const High_1 = require("@civ-clone/core-rule/Priorities/High");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const ProcessYield_1 = require("@civ-clone/core-city/Rules/ProcessYield");
const Sold_1 = require("@civ-clone/core-treasury/Rules/Sold");
/**
 * A build that needed an improvement its city no longer has is dropped as the improvement goes, and its player
 * chooses again (civ-clone/web-renderer#965): a Bank once the Marketplace is sold, a University once the Library is
 * sabotaged, a Power Plant once the Factory can't be paid for. `OBSOLETE_BUILDS`' discovery rule dropped these at the
 * owner's next discovery. "Needed" is a `requires` entry that names the improvement and now refuses the build, in the
 * cities its range speaks for: for an improvement, the city's own.
 *
 * v474.05 goes on building it: completing an improvement checks only its cost, and whether the city has one already
 * (CITYMGT.C `city_process`, `if (townbuf[city].buildings & (1L << (scratch_i - 1))) scratch_i = -1;`); the Marketplace
 * a Bank needs, the Library a University needs and the Factory a Power Plant needs are asked only by `find_slot`'s menu
 * (ECONOMY.C 200). Selling (CITYMGT.C, `townbuf[city].buildings -= 1L << item_b;`), sabotage (DIPLOMAT.C,
 * `townbuf[city_id].buildings &= ~(1 << i);`) and upkeep that can't be paid (CITYMGT.C, `can't maintain`) take the
 * improvement and leave `production` as it was. Nor does the city screen flag it: it flashes the Change button only for
 * an improvement the city has, a spaceship part after launch and a Wonder built elsewhere (CITYMGT.C 1290-1295).
 *
 * The ways an improvement leaves a city, and the rules here that see each:
 * - sold (`core-treasury`'s `PlayerTreasury#sell`): its `Sold` rules, which name it;
 * - sabotaged (`civ1-unit:unit/city-sabotaged/sabotage`): noted before the `CitySabotaged` rules, compared after;
 * - not paid for (`civ1-treasury:city/process-yield/gold`): noted before each `ProcessYield` rule, compared after;
 * - with its city (`City#destroy`, however it comes: starved out while its yields are processed, by its last Settlers,
 *   by a capture): left alone, by every rule here, even when the city is destroyed between a note and its comparison.
 *   Its own builds go with it, and a Wonder lost with its city was still built: v474.05 marks it lost (ECONOMY.C 94-96,
 *   `marvel_site[j] = 0x80`), not unbuilt (`-1`), and its menu asks only whether the Manhattan Project and the Apollo
 *   Program were ever built (ECONOMY.C 172, 202), so Nuclear units and spaceship parts are not dropped either
 *   (civ-clone/web-renderer#965). Wonders are never on the lost side at all (`losableImprovements`): no other way takes
 *   one from a standing city;
 * - with the city's capture (`civ1-city-improvement`'s `Captured` rule): left alone, as the new owner's build is
 *   cleared, or is the item v474.05 lets the human keep, whatever they can build (`civ1-city:city/captured/keep-build`);
 * - made obsolete (Barracks, by `civ1-city-improvement`) or replaced (the Palace, when it moves): nothing needs either.
 *
 * Noted at `High` and compared at `Low`, so the rule that takes the improvement runs between them in whatever order the
 * packages load.
 */
const getRules = (game) => {
    // What each city had before the rules that may take an improvement ran: only for one building something a lost one
    //  could refuse.
    const noted = new Map(), note = (city) => {
        noted.set(city, (0, refusedBuilds_1.losableImprovements)(game, city));
    }, lostSince = (city) => {
        var _a;
        const before = (_a = noted.get(city)) !== null && _a !== void 0 ? _a : [], now = (0, refusedBuilds_1.losableImprovements)(game, city);
        noted.delete(city);
        return before.filter((improvement) => !now.includes(improvement));
    }, noteIfBuildingWhatMayNeedOne = (city) => {
        if ((0, refusedBuilds_1.mayNeedAnImprovement)(game, city)) {
            note(city);
        }
    }, 
    // A city destroyed between the note and now (a Food `ProcessYield` that starves it out: `FoodExhausted`, then
    //  `civ1-city:city/shrink/destroy-empty-city`) has lost nothing a build elsewhere needed: its note is forgotten.
    dropIfLost = (city) => {
        if (!noted.has(city)) {
            return;
        }
        const lost = lostSince(city);
        if (city.destroyed()) {
            return;
        }
        (0, refusedBuilds_1.dropBuildsThatNeeded)(game, lost, city, city.player());
    };
    return [
        new Sold_1.default(RuleIds_1.DROP_BUILDS_NEEDING_SOLD_RULE, new Low_1.default(), new Effect_1.default((cityImprovement) => (0, refusedBuilds_1.dropBuildsThatNeeded)(game, [cityImprovement], cityImprovement.city(), cityImprovement.city().player()))),
        new CitySabotaged_1.default(RuleIds_1.NOTE_SABOTAGED_RULE, new High_1.default(), new Effect_1.default((unit, city) => noteIfBuildingWhatMayNeedOne(city))),
        new CitySabotaged_1.default(RuleIds_1.DROP_BUILDS_NEEDING_SABOTAGED_RULE, new Low_1.default(), new Effect_1.default((unit, city) => dropIfLost(city))),
        new ProcessYield_1.default(RuleIds_1.NOTE_UNSUPPORTED_RULE, new High_1.default(), new Effect_1.default((cityYield, city) => noteIfBuildingWhatMayNeedOne(city))),
        new ProcessYield_1.default(RuleIds_1.DROP_BUILDS_NEEDING_UNSUPPORTED_RULE, new Low_1.default(), new Effect_1.default((cityYield, city) => dropIfLost(city))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=lostImprovements.js.map