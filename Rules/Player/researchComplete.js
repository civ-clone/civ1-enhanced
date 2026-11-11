"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const refusedBuilds_1 = require("../../lib/refusedBuilds");
const Complete_1 = require("@civ-clone/core-science/Rules/Complete");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const getRules = (game) => [
    new Complete_1.default(
    // A discovery can make what a city is building obsolete, as Gunpowder does Spearman: the city stops and its player
    //  chooses again (civ-clone/web-renderer#693). v474.05 goes on building it, as a game does with `OBSOLETE_BUILDS`
    //  off (civ-clone/web-renderer#954): the human's city completes it (CITYMGT.C `city_process` takes a unit's shields
    //  with no check of `obsolete_by`, which only `find_slot`'s menu reads, ECONOMY.C 174), and a computer player chooses
    //  every city's build again at each of its discoveries, whatever they were (ECONOMY.C 577, `retarget(civ, -1)`).
    //
    //  Only what the discovery made obsolete: a build an `obsoletedBy` entry naming this advance now refuses. A build
    //  that can't be made for any other reason is left, such as one a city kept when the human captured it
    //  (`civ1-city:city/captured/keep-build`); one that lost what it needed, or that a Wonder now excludes, is dropped
    //  when that happens, by this set's other rules (civ-clone/web-renderer#965). Each entry is asked about only the
    //  cities its own range speaks for: for a unit, the discoverer's, in the order they always were. A `world` entry
    //  (civ1-wonder's obsolete Wonders) reaches other players' cities only for its own refusal, and none is made from
    //  those, as v474.05's menu goes on offering an obsolete Wonder (ECONOMY.C 213): so another player's discovery, of
    //  Gunpowder say, drops nothing.
    //  In plugin order this package loads before civ1-science, so the build is dropped before `player:research-complete`
    //  is raised rather than after, as it was from civ1-unit: the end state is the same.
    RuleIds_1.REVALIDATE_BUILDS_RULE, new Effect_1.default((playerResearch, advance) => (0, refusedBuilds_1.dropBuildsFor)(game, (0, refusedBuilds_1.entriesNaming)(game, 'obsoletedBy', advance), null, playerResearch.player()))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=researchComplete.js.map