import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import { Mountains, River } from '@civ-clone/civ1-world/Terrains';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { HYDRO_PLANT_SITE_RULE } from '../../RuleIds';
import { HydroPlant } from '@civ-clone/civ1-city-improvement/CityImprovements';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Tile from '@civ-clone/core-world/Tile';

/**
 * A Hydro Plant is built with Mountains or a River on or next to the city's square, as the manual has it ("on or
 * near"). v474.05 looks only at the eight squares around the city, and not its own (`civ1-city-improvement`'s
 * `city/build/hydro-plant-site`, which this takes the place of while `HYDRO_PLANT_SITE` is on:
 * civ-clone/web-renderer#954).
 */
export const hydroPlantSiteRule = (): Build =>
  new Build(
    HYDRO_PLANT_SITE_RULE,
    HydroPlant,
    new Criterion(
      (city: City, BuildItem: IConstructor): boolean => BuildItem === HydroPlant
    ),
    new Effect(
      (city: City): IBuildCriterion =>
        new Criterion((): boolean =>
          [city.tile(), ...city.tile().getNeighbours()].some(
            (tile: Tile): boolean =>
              tile.terrain() instanceof Mountains ||
              tile.terrain() instanceof River
          )
        )
    )
  );

export const getRules = (): Build[] => [hydroPlantSiteRule()];

export default getRules;
