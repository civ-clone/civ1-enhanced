"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const TileImprovements_1 = require("@civ-clone/civ1-world/TileImprovements");
const RuleIds_1 = require("../../RuleIds");
const BuildOnCitySquare_1 = require("@civ-clone/civ1-unit/Rules/BuildOnCitySquare");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Types_1 = require("@civ-clone/civ1-unit/Types");
const Actions_1 = require("@civ-clone/civ1-unit/Actions");
const MovementCost_1 = require("@civ-clone/core-unit/Rules/MovementCost");
/**
 * Railroads in cities, as the game always had them (civ-clone/web-renderer#1029): Settlers may build a Railroad on a
 * city's square, and a land unit moves for nothing between two squares that both have a Railroad. v474.05 refuses a
 * Railroad on a city's square and moves for nothing from a Railroad to any square with a Road (`civ1-unit`'s rules,
 * which these take the place of while `RAILROADS_IN_CITIES` is on).
 */
const getRules = (game) => {
    const has = (tile, Improvement) => game.tileImprovements
        .getByTile(tile)
        .some((improvement) => improvement instanceof Improvement);
    return [
        // What allows a city's Railroad is superseding `civ1-unit`'s refusal: a `BuildOnCitySquare` rule that answers `true`
        //  can't undo another's `false`. This says so where the rules are listed, and gives the set a rule of its own, as a
        //  set with nothing to switch can't be switched.
        new BuildOnCitySquare_1.default(RuleIds_1.RAILROAD_IN_CITIES_RULE, new Criterion_1.default((tile, Improvement) => Improvement === TileImprovements_1.Railroad), new Effect_1.default(() => true)),
        new MovementCost_1.default(RuleIds_1.RAILROAD_ON_BOTH_SQUARES_RULE, new Criterion_1.default((unit, action) => action instanceof Actions_1.Move), new Criterion_1.default((unit) => unit instanceof Types_1.Land), new Criterion_1.default((unit, action) => has(action.from(), TileImprovements_1.Railroad)), new Criterion_1.default((unit, action) => has(action.to(), TileImprovements_1.Railroad)), new Effect_1.default(() => 0), 
        // What a railroad gives, for the Civilopedia (civ-clone/web-renderer#1272), as `civ1-unit`'s rule says it.
        new Description_1.default({
            type: 'route_free',
            subject: TileImprovements_1.Railroad,
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=railroadsInCities.js.map