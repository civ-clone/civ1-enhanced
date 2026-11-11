# civ1-enhanced

Rules that change Civilization I's, each in a rule set a new game can switch (civ-clone/web-renderer#954). For the
rules below, the `civ1-*` packages play as v474.05 does and this one holds the departures from it, so that a game
without it loaded, or with its sets switched off, plays them as v474.05. Other departures from v474.05 are still inside
the `civ1-*` packages (see the survey on civ-clone/web-renderer#954), and move here one at a time.

Every set is beneath `civ1-enhanced` (`RuleSets.ENHANCED`), which a setup window can draw as one three-state checkbox.
A set that `supersedes` a Civ1 rule takes its place while the set is on, and gives it back when switched off, without
the Civ1 package knowing (`@civ-clone/core-rule`'s `RuleSet`). One whose Civ1 package is not loaded is only an orphan,
which `validate()` shows and does not block on.

The ids it supersedes are imported from each Civ1 package's `RuleIds`, so a rule renamed there breaks this package's
build rather than leaving both rules running. Its own rule ids are exported the same way, from `RuleIds.ts`.

## Rule sets

- `civ1-enhanced:hydro-plant-site` (`HYDRO_PLANT_SITE`), off to start with: `civ1-enhanced:city/build/hydro-plant-site`
  lets a city build a Hydro Plant with Mountains or a River on its own square as well as next to it, as the manual's
  "on or near" has it. Supersedes `civ1-city-improvement:city/build/hydro-plant-site`, which, as v474.05, looks only
  at the eight squares around the city.
- `civ1-enhanced:barbarian-leader-ransom` (`BARBARIAN_LEADER_RANSOM`), on to start with:
  `civ1-enhanced:unit/destroyed/ransom` pays a civilization 100 gold for a barbarian leader it kills however he dies,
  in a stack that another unit defended too (civ-clone/web-renderer#171), through `civ1-barbarians`' `lib/ransom`, so
  `barbarians:ransom` is emitted as before. Supersedes `civ1-barbarians:unit/defeated/ransom`, which, as v474.05, pays
  only for a leader who defends and loses.
- `civ1-enhanced:obsolete-builds` (`OBSOLETE_BUILDS`), on to start with:
  `civ1-enhanced:player/research-complete/revalidate-builds` drops what a city is building once a discovery makes it
  obsolete, as Gunpowder does Spearman, and its player chooses again (civ-clone/web-renderer#693). A rule added to
  Civ1's, so it supersedes nothing: switched off, a city finishes the build, as v474.05's does.
