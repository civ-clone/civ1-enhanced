import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import City from '@civ-clone/core-city/City';
import Complete from '@civ-clone/core-science/Rules/Complete';
import Effect from '@civ-clone/core-rule/Effect';
import { REVALIDATE_BUILDS_RULE } from '../../RuleIds';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';

export const getRules: (
  cityRegistry?: CityRegistry,
  cityBuildRegistry?: CityBuildRegistry
) => Complete[] = (
  cityRegistry: CityRegistry = cityRegistryInstance,
  cityBuildRegistry: CityBuildRegistry = cityBuildRegistryInstance
): Complete[] => [
  new Complete(
    // A discovery can make what a city is building obsolete, as Gunpowder does Spearman: the city stops and its player
    //  chooses again (civ-clone/web-renderer#693). v474.05 goes on building it, as a game does with `OBSOLETE_BUILDS`
    //  off (civ-clone/web-renderer#954).
    REVALIDATE_BUILDS_RULE,
    new Effect((playerResearch: PlayerResearch): void =>
      cityRegistry
        .getByPlayer(playerResearch.player())
        .forEach((city: City): void =>
          cityBuildRegistry.getByCity(city).revalidate()
        )
    )
  ),
];

export default getRules;
