"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.researchAges = exports.Space = exports.Modern = exports.Electric = exports.Industrial = exports.Renaissance = exports.Medieval = exports.Classical = exports.Ancient = void 0;
const Age_1 = require("@civ-clone/base-science-age/Age");
// Civilization's ages, one for each tier of `ResearchTiers` (civ-clone/web-renderer#1076). Named for what each tier
//  holds rather than for history: Civ1's tree puts Computers in the sixth and Flight in the seventh.
class Ancient extends Age_1.default {
}
exports.Ancient = Ancient;
class Classical extends Age_1.default {
}
exports.Classical = Classical;
class Medieval extends Age_1.default {
}
exports.Medieval = Medieval;
class Renaissance extends Age_1.default {
}
exports.Renaissance = Renaissance;
class Industrial extends Age_1.default {
}
exports.Industrial = Industrial;
class Electric extends Age_1.default {
}
exports.Electric = Electric;
class Modern extends Age_1.default {
}
exports.Modern = Modern;
class Space extends Age_1.default {
}
exports.Space = Space;
/** The ages in order: the n-th is the age of the n-th tier's advances. */
exports.researchAges = [
    Ancient,
    Classical,
    Medieval,
    Renaissance,
    Industrial,
    Electric,
    Modern,
    Space,
];
exports.default = exports.researchAges;
//# sourceMappingURL=Ages.js.map