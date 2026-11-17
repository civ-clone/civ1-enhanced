import AdvanceCount from '@civ-clone/core-science/Rules/AdvanceCount';
import Effect from '@civ-clone/core-rule/Effect';
import { EVERY_ADVANCE_COUNT_RULE } from '../../RuleIds';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';

export const getRules = (): AdvanceCount[] => [
  // Every advance known counts, those the player started with too, as the game always counted them: v474.05 counts
  //  only those gained in play (`civ1-science`'s rule).
  new AdvanceCount(
    EVERY_ADVANCE_COUNT_RULE,
    new Effect(
      (playerResearch: PlayerResearch): number =>
        playerResearch.complete().length
    )
  ),
];

export default getRules;
