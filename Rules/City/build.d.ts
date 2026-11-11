import { Build } from '@civ-clone/core-city-build/Rules/Build';
/**
 * A Hydro Plant is built with Mountains or a River on or next to the city's square, as the manual has it ("on or
 * near"). v474.05 looks only at the eight squares around the city, and not its own (`civ1-city-improvement`'s
 * `city/build/hydro-plant-site`, which this takes the place of while `HYDRO_PLANT_SITE` is on:
 * civ-clone/web-renderer#954).
 */
export declare const hydroPlantSiteRule: () => Build;
export declare const getRules: () => Build[];
export default getRules;
