/**
 * What the rate of research cost is multiplied by in each of the eight ages (`Ages`, one for each tier of
 * `ResearchTiers`), in place of v474.05's doubling from AD (civ-clone/web-renderer#1077): a steady slide from 0.5 to 3,
 * each 6^(1/7) times the last, rounded. Learning every advance in order at fixed costs (each in its own tier's age)
 * then costs about what a game reaching AD at its 25th advance does today. For play-testing.
 */
export declare const ageRateMultipliers: number[];
/**
 * The tier (by its index in `ResearchTiers`) from which a player's own rate rises by v474.05's catch-up when the leader
 * is ahead of schedule, in place of from AD: the fourth, the Renaissance.
 */
export declare const catchUpFromTier = 3;
export default ageRateMultipliers;
