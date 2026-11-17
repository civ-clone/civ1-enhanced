import { Tier } from '@civ-clone/base-science-research-tiered-cost/lib/tiers';
/**
 * Civilization's advances in eight tiers by how many advances each needs in its whole tree, and what a step of the rate
 * costs in each (civ-clone/web-renderer#1072). The weights are each tier's mean position when the 67 advances are
 * learnt in order of their prerequisites (`positionWeights`: 4, 12.5, 23, 32.5, 39.5, 47, 54.5 and 62.5), rounded so
 * they still add up to 1 + 2 + … + 67 = 2,278 steps: what learning them all costs by `civ1-science`'s rule.
 *
 * 1. Alphabet, Bronze Working, Ceremonial Burial, Horseback Riding, Masonry, Pottery, The Wheel.
 * 2. Code of Laws, Currency, Iron Working, Map Making, Mysticism, Writing, Mathematics, Construction, Literacy,
 *    Monarchy.
 * 3. The Republic, Trade, Astronomy, Bridge Building, Engineering, Feudalism, Philosophy, Chivalry, Democracy,
 *    Navigation, Religion.
 * 4. Banking, Physics, Magnetism, University, Invention, Medicine, Theory of Gravity, Gunpowder.
 * 5. Chemistry, Atomic Theory, Metallurgy, Steam Engine, Explosives, Railroad.
 * 6. Conscription, Electricity, Electronics, Industrialization, Computers, Corporation, Communism, Genetic
 *    Engineering, Steel.
 * 7. Refining, Combustion, Flight, Automobile, Mass Production, Advanced Flight.
 * 8. Labor Union, Recycling, Nuclear Fission, Rocketry, Space Flight, Plastics, Nuclear Power, Robotics,
 *    Superconductor, Fusion Power.
 */
export declare const researchTiers: Tier[];
export default researchTiers;
