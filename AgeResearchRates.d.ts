/**
 * What the rate of research cost is multiplied by in each of the eight ages (`Ages`, one for each tier of
 * `ResearchTiers`), in place of v474.05's doubling from AD (civ-clone/web-renderer#1077): a steady slide from 0.5 to 3,
 * each 6^(1/7) times the last, rounded. Learning every advance in order at fixed costs, the first of each age at the
 * age before, then costs 4,191 steps times the rate before catch-up (4,203 by `civ1-science`'s cost): about what a game
 * reaching AD at its 25th advance does today, 4,256. For play-testing.
 */
export declare const ageRateMultipliers: number[];
/**
 * The tier (by its index in `ResearchTiers`) from which a player's own rate rises by v474.05's catch-up when the leader
 * is ahead of schedule, in place of from AD: the fourth, the Renaissance.
 */
export declare const catchUpFromTier = 3;
export default ageRateMultipliers;
